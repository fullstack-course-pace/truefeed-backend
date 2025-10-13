const express = require("express");
const app = express();
// const PORT = process.env.PORT || 5000;

const session = require("express-session");
// const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const cors = require("cors");
const logger = require("../utils/logger");
const {
  FRONTEND_ORIGIN,
  SESSION_SECRET,
  NODE_ENV,
} = require("../config/envPath");

app.use(express.json());

// HTTP request logging with morgan -> winston
app.use(morgan("combined", { stream: logger.stream }));

// CORS - allow frontend to send cookies for authentication
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
// Files route will stream DB-backed uploads

// If running behind a proxy/load balancer in production, trust proxy to allow secure cookies
if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// attach logger to requests for downstream handlers
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Session configuration is deferred to server startup to avoid creating DB
// connections during module import. Call `initSessions(sessionStore)` from
// the server entrypoint (server.js) before listening.
const sessionSecret = SESSION_SECRET;

function initSessions(store) {
  if (!store) {
    throw new Error(
      "initSessions requires a session store (e.g. connect-mongo)"
    );
  }
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );
}

let routesRegistered = false;

function registerRoutes() {
  if (routesRegistered) return;

  // Mount auth routes (register, login) - only use versioned v1 routes
  const v1Auth = require("./v1/authRoutes");
  app.use("/api/v1/auth", v1Auth);

  // simple auth middleware using session
  function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    }
    logger.warn(
      "Unauthorized access attempt to %s from %s",
      req.originalUrl,
      req.ip
    );
    return res.status(401).json({ error: "unauthorized" });
  }

  // Mount versioned logs routes
  const v1Logs = require("./v1/logsRoutes");
  app.use("/api/v1/logs", requireAuth, v1Logs);

  // Mount profile routes (current user)
  const v1Profile = require("./v1/profileRoutes");
  app.use("/api/v1/profile", requireAuth, v1Profile);

  // Mount post routes (create/list)
  const v1Posts = require("./v1/postRoutes");
  app.use("/api/v1/posts", requireAuth, v1Posts);

  // Public files streaming (GridFS) by id
  const v1Files = require("./v1/filesRoutes");
  app.use("/api/v1/files", v1Files);

  // Express error handler to log errors
  app.use((err, req, res, next) => {
    logger.error("Unhandled error: %o", err);
    res.status(500).json({ error: "internal server error" });
  });

  routesRegistered = true;
}

module.exports = { app, initSessions, registerRoutes };
