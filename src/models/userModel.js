const { connect } = require("../config/dbConnection");
const { ObjectId } = require("mongodb");

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

async function findById(id, permission = "read") {
  const { client, db } = await connect(permission);
  try {
    const users = db.collection("users");
    const u = await users.findOne({ _id: new ObjectId(id) });
    return u;
  } finally {
    await client.close();
  }
}

async function updateUserById(id, updates) {
  const { client, db } = await connect("write");
  try {
    const users = db.collection("users");
    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result;
  } finally {
    await client.close();
  }
}

module.exports = { findByEmail, createUser, findById, updateUserById };
