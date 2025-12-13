const genAI = require("@google/genai");
const { GEMINI_API_KEY } = require("../config/envPath");

const ai = new genAI.GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "who is the president of the united states?",
  });
  console.log(response.text);
}

// main();
module.exports = { main };
