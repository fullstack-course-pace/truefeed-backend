const express = require("express");
const router = express.Router();
const controller = require("../../controllers/postController");
const { validateBody, sanitizeString } = require("../../middleware/validate");
const multer = require("multer");
const { connect } = require("../../config/dbConnection");
const { GridFSBucket } = require("mongodb");

// Multer memory storage for GridFS (post media)
const uploadMedia = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ok = /^(image\/(png|jpeg|jpg|gif|webp)|video\/(mp4|webm|ogg))$/i.test(
      file.mimetype || ""
    );
    cb(null, ok);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Create a new post (validated)
router.post(
  "/",
  validateBody({
    content: { type: "string", required: false, maxLen: 2000 },
    mediaUrl: { type: "string", required: false, maxLen: 1024, format: "url" },
  }),
  controller.create
);

// List current user's posts
router.get("/mine", controller.myPosts);

// Upload media for a post (multipart/form-data, field name: media)
router.post("/upload-media", uploadMedia.single("media"), async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const { client, db } = await connect("write");
  try {
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });
    const filename = `${req.session.userId}-post-${Date.now()}-${(
      req.file.originalname || "file"
    ).replace(/\s+/g, "_")}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: req.file.mimetype || "application/octet-stream",
      metadata: { userId: req.session.userId, kind: "post" },
    });
    uploadStream.end(req.file.buffer);
    uploadStream.on("finish", async (file) => {
      await client.close();
      return res
        .status(201)
        .json({ url: `/api/v1/files/${file._id.toString()}` });
    });
    uploadStream.on("error", async () => {
      await client.close();
      return res.status(500).json({ error: "upload failed" });
    });
  } catch (e) {
    await client.close();
    return res.status(500).json({ error: "upload failed" });
  }
});

// Create a post and upload media in one step (multipart/form-data)
router.post(
  "/create-with-media",
  uploadMedia.single("media"),
  async (req, res) => {
    if (!req.session || !req.session.userId)
      return res.status(401).json({ error: "Not authenticated" });

    const content =
      typeof req.body?.content === "string"
        ? sanitizeString(req.body.content, { maxLen: 2000 })
        : "";

    let mediaUrl = "";
    let fileId = null;

    if (req.file) {
      const { client, db } = await connect("write");
      try {
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });
        const filename = `${req.session.userId}-post-${Date.now()}-${(
          req.file.originalname || "file"
        ).replace(/\s+/g, "_")}`;
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: req.file.mimetype || "application/octet-stream",
          metadata: { userId: req.session.userId, kind: "post" },
        });
        uploadStream.end(req.file.buffer);
        const file = await new Promise((resolve, reject) => {
          uploadStream.on("finish", resolve);
          uploadStream.on("error", reject);
        });
        fileId = file?._id || null;
        if (fileId) mediaUrl = `/api/v1/files/${fileId.toString()}`;

        // Create post with mediaUrl
        const result = (await controller.create.bind({})) // avoid binding issues if any
          ? null
          : null;
        // Use model directly to avoid double response
        const postModel = require("../../models/postModel");
        const insert = await postModel.createPost({
          userId: req.session.userId,
          content,
          mediaUrl,
        });

        // Backfill file metadata with postId (optional)
        if (fileId) {
          await db
            .collection("uploads.files")
            .updateOne(
              { _id: fileId },
              { $set: { "metadata.postId": insert.insertedId } }
            );
        }

        await client.close();
        return res.status(201).json({ id: insert.insertedId, mediaUrl });
      } catch (e) {
        return res.status(500).json({ error: "upload or create failed" });
      }
    } else {
      // No media: just create post with content
      try {
        const postModel = require("../../models/postModel");
        const insert = await postModel.createPost({
          userId: req.session.userId,
          content,
          mediaUrl: "",
        });
        return res.status(201).json({ id: insert.insertedId });
      } catch (e) {
        return res.status(500).json({ error: "create failed" });
      }
    }
  }
);

module.exports = router;
