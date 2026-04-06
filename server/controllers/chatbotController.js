import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import DocumentModel from "../model/docModel.js";

dotenv.config({path: "../.env"});
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const chatbot = async (req, res, next) => {
    try {
        const { question } = req.body;
        const docID = req.params.id;
        const userID = req.user.id;
        if(!question || !docID) {
            return res.status(400).json({message: "Question and Document ID required!"});
        }
        const document = await DocumentModel.findById(docID);
        if(!document) {
            return res.status(404).json({error: "Document not found!"});
        }
        if(!document.createdBy.equals(userID) && !document.access.edit.includes(userID) && !document.access.view.includes(userID)) {
            return res.status(403).json({message: "Only collaborators/owner can access the chatbot for this document"});
        }

        const prompt = `
You are an AI Assistant helping users understand documents.
Document Text: 
${document.content}

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
        next(error);
    }
}

