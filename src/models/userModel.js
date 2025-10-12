const { connect } = require("../config/dbConnection");

async function findByEmail(email, permission = "read") {
  const { client, db } = await connect(permission);
  try {
    const users = db.collection("users");
    const u = await users.findOne({ email });
    return u;
  } finally {
    await client.close();
  }
}

async function createUser(user) {
  const { client, db } = await connect("write");
  try {
    const users = db.collection("users");
    const result = await users.insertOne(user);
    return result;
  } finally {
    await client.close();
  }
}

module.exports = { findByEmail, createUser };
