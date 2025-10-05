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

const updateDocument = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const userID = req.user.id;
        const document = await DocumentModel.findById(docID);
        if(!document)
            return res.status(404).json({ error: "Document not found" });
        if(!document.access.edit.includes(userID))
            return res.status(403).json({ error: "You don't have permission to edit this document" });

        const updatedFields = {
            title: req.body.title,
            content: req.body.content
        }
        const updatedDoc = await DocumentModel.findByIdAndUpdate( docID, 
            updatedFields,
            { new: true, overwrite: true }
        )

        res.status(200).json({ 
            message: "Document updated successfully",
            document: updatedDoc
        })
    } catch (error) {
        next(error);
    }
}
export {
    createDocument,
    getDocument,
    updateDocument
}