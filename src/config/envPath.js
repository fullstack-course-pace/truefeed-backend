const PORT = process.env.PORT;
const DB_NAME = process.env.DB_NAME;
const ADMIN_URI = process.env.ADMIN_URI;
const EDITOR_URI = process.env.EDITOR_URI;
const READER_URI = process.env.READER_URI;
const DATABASE_URL = process.env.DATABASE_URL;
const USER_COLLECTION = process.env.USER_COLLECTION;
const POST_COLLECTION = process.env.POST_COLLECTION;
const COMMENT_COLLECTION = process.env.COMMENT_COLLECTION;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const SESSION_SECRET =
  process.env.SESSION_SECRET || process.env.JWT_SECRET || "dev_session_secret";
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  PORT,
  DB_NAME,
  ADMIN_URI,
  EDITOR_URI,
  READER_URI,
  DATABASE_URL,
  USER_COLLECTION,
  POST_COLLECTION,
  COMMENT_COLLECTION,
  FRONTEND_ORIGIN,
  SESSION_SECRET,
  NODE_ENV,
};
