import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({path: "../.env"});
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const chatbot = async (req, res) => {
    try {
        const {question, docText} = req.body;
        if(!question || !docText) {
            return res.status(400).json({message: "Question and Document Text required!"});
        }

        const prompt = `
You are an AI Assistant helping users unserstand documents.
Document Text: 
${docText}

Question:
${question}

Answer clearly and in a concise manner.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        })

        res.status(200).json({
            message: "Successful response",
            answer: response.text
        })
    } catch (error) {
        console.error("Chatbot Error:", error);
    }
}

