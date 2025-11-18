const ai = require("./services/geminiService");

async function generateAIContent(req, res) {
  //   const { prompt } = req.body || {};
  try {
    const response = await ai.main();
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error generating AI content:", error);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
}

module.exports = { generateAIContent };
