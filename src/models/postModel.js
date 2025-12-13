const { connect } = require("../config/dbConnection");
const { ObjectId } = require("mongodb");

async function createPost({ userId, content, mediaUrl }) {
  const { client, db } = await connect("write");
  try {
    const posts = db.collection("posts");
    const result = await posts.insertOne({
      userId: new ObjectId(userId),
      content: content || "",
      mediaUrl: mediaUrl || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  } finally {
    await client.close();
  }
}

async function listUserPosts(userId) {
  const { client, db } = await connect("read");
  try {
    const posts = db.collection("posts");
    const cursor = posts
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 });
    return await cursor.toArray();
  } finally {
    await client.close();
  }
}

module.exports = { createPost, listUserPosts };
