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

const getDocument = async (req, res, next) => {
    try {
        const userID = req.user.id;
        const documents = await DocumentModel.find({
            $or: [
                { 'access.view': userID },
                { 'access.edit': userID },
                { createdBy: userID }
            ]
        })
        res.status(200).json({ 
            message: "Documents fetched successfully",
            documents
        })
    } catch (error) {
        next(error);
    }
}
export {
    createDocument,
    getDocument,
}