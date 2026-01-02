const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const v1beta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const dataBeta = await v1beta.json();
        console.log("--- v1beta ---");
        console.log(JSON.stringify(dataBeta, null, 2));

        const v1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
        const dataV1 = await v1.json();
        console.log("--- v1 ---");
        console.log(JSON.stringify(dataV1, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listModels();
