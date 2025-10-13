const postModel = require("../models/postModel");

// Create a new post for the current user
async function create(req, res) {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const { content, mediaUrl } = req.validatedBody || req.body || {};
  try {
    const result = await postModel.createPost({
      userId: req.session.userId,
      content,
      mediaUrl,
    });
    return res.status(201).json({ id: result.insertedId });
  } catch (err) {
    req.logger?.error("Create post error for %s: %o", req.session.email, err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// List posts for current user (simple helper)
async function myPosts(req, res) {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  try {
    const posts = await postModel.listUserPosts(req.session.userId);
    return res.json({ posts });
  } catch (err) {
    req.logger?.error("List posts error for %s: %o", req.session.email, err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { create, myPosts };
