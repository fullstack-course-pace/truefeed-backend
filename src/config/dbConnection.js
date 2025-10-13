const { MongoClient, ServerApiVersion } = require("mongodb");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = (permission) => {
  // Preference: specific URIs for roles, otherwise fallback to common DATABASE_URL
  let URI = process.env.DATABASE_URL;
  if (permission === "super" && process.env.ADMIN_URI) {
    URI = process.env.ADMIN_URI;
  } else if (permission === "write" && process.env.EDITOR_URI) {
    URI = process.env.EDITOR_URI;
  } else if (permission === "read" && process.env.READER_URI) {
    URI = process.env.READER_URI;
  }
  return new MongoClient(URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
};

// Convenience connect function that returns a connected client and the db
async function connect(permission = "write") {
  const c = client(permission);
  try {
    await c.connect();
    const dbName = process.env.DB_NAME || "truefeed";

    const db = c.db(dbName);
    return { client: c, db };
  } catch (err) {
    const logger = require("../utils/logger");
    logger.error(
      "Error connecting to database (permission=%s): %o",
      permission,
      err
    );
    throw err;
  }
}

module.exports = { client, connect };
