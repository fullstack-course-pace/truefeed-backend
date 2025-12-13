const genAI = require("@google/genai");
const { GEMINI_API_KEY, GEMINI_MODEL_NAME } = require("../config/envPath");
// const { content } = require("@google/genai").types;
// from google.ai.generativelanguage_v1beta.types import content

const ai = new genAI.GoogleGenAI({ apiKey: GEMINI_API_KEY });

const groundingTool = {
  googleSearch: {},
};

const config = {
  tools: [groundingTool],
};

async function generate() {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_NAME,
    contents: "who is the president of the united states?",
    config,
  });
  return response.text;
}

async function checkCredibility(text) {
  // response_schema = {
  //   type: "object",
  //   properties: {
  //     fact_check_status: {
  //       type: "string",
  //       enum: ["verified", "disputed", "debunked"],
  //     },
  //     summary: { type: "string" },
  //     key_points: {
  //       type: "array",
  //       items: { type: "string" },
  //     },
  //     credibility_score: { type: "integer", description: "Score from 0-10" },
  //   },
  //   required: ["fact_check_status", "summary", "credibility_score"],
  // };

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_NAME,
    contents: text,
    config,
  });
  return response.text;
}

// main();
module.exports = { generate, checkCredibility };
