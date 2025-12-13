const e = require("express");
const ai = require("../services/geminiService");
const logger = require("../utils/logger");

async function generateAIContent(req, res) {
  //   const { prompt } = req.body || {};
  try {
    const response = await ai.generate();
    return res.status(200).json({ response });
  } catch (error) {
    console.error("Error generating AI content:", error);
    return res.status(500).json({ error: "Failed to generate AI content" });
  }
}

async function checkAICredibility(req, res) {
  logger.info("Received credibility check request: %o", req.body);
  try {
    let { checkFor } = req.body || "";
    checkFor +=
      "\n\nIs the above information credible? Answer yes or no and explain why. Also, Give me credibility score out of 10.";
    const response = await ai.checkCredibility(checkFor);
    return res.status(200).json({ response });
  } catch (error) {
    console.error("Error checking AI credibility:", error);
    return res.status(500).json({ error: "Failed to check AI credibility" });
  }
}

module.exports = { generateAIContent, checkAICredibility };
