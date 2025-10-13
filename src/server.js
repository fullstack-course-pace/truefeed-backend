require("dotenv").config();
const { app, initSessions, registerRoutes } = require("./routes/api");
const MongoStore = require("connect-mongo");
const {
  PORT,
  DATABASE_URL,
  EDITOR_URI,
  ADMIN_URI,
} = require("./config/envPath");

(async function start() {
  // create the session store during startup so module import doesn't connect
  const mongoUrl = EDITOR_URI || ADMIN_URI;
  let store;
  if (mongoUrl) {
    store = MongoStore.create({ mongoUrl, collectionName: "sessions" });
  } else {
    throw new Error(
      "No DATABASE_URL provided; session store requires a MongoDB URL"
    );
  }

  // initialize session middleware on the app
  initSessions(store);

  // register routes after sessions are initialized
  registerRoutes();

  app.listen(PORT, () => {
    const logger = require("./utils/logger");
    logger.info("Server is running on port %s", PORT);
  });
})();

module.exports = app;
