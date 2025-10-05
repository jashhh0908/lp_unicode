import mongoose from "mongoose";
import DocumentModel from "../model/docModel.js";

const createDocument = async (req, res, next) => {
    try {
        
        const { title, content } = req.body;
        const userID = new mongoose.Types.ObjectId(req.user.id); 
        if(!title)
            return res.status(400).json({ error: "Title is required" });
        const newDocument = await DocumentModel.create({ 
            title,
            content: content || "",
            createdBy: userID,
            access: { view: [userID], edit: [userID]},
        });

        res.status(201).json({ 
            message: "Document created successfully",
            document: newDocument
        })
    } catch (error) {
        next(error);
    }
}

export {
    createDocument
}