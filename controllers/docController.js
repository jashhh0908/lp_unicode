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

const deleteDocument = async (req, res, next) => {
    try {
        const userID = new mongoose.Types.ObjectId(req.user.id);
        const docID = req.params.id;
        const document = await DocumentModel.findById(docID);
        if(!document)
            return res.status(404).json({error: "Document not found"});
        if(!document.createdBy.equals(userID))
            return res.status(403).json({error: "You don't have permission to delete this document"});    
        const deleted = await DocumentModel.findByIdAndDelete(docID);
        if(deleted)
            return res.status(200).json({message: "Document deleted successfully"});
        else
            return res.status(500).json({error: "Document deletion failed"});
    } catch (error) {
        next(error);
    }
}

// Access Management 

const requestAccess = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const userID = req.user.id;
        const req_type = req.body.type;
        if(!['view', 'edit'].includes(req_type))
            return res.status(400).json({ error: "Invalid access type. Must contain 'view' or 'edit'" });
        const document = await DocumentModel.findById(docID);
        if(!document) 
            return res.status(404).json({error: "Document not found"})

        if(req_type === 'view' && document.access.view.includes(userID))
            return res.status(400).json({error: "You already have viewing access to this document"});

        if(req_type === 'edit' && document.access.edit.includes(userID))
            return res.status(400).json({error: "You already have editing access to this document"});
        
        //check if the request already exists
        const exists = document.requests.find(function(r) {
            return r.user.toString() === userID && r.type === req_type && r.status === "pending";
        })
        if(exists)
            return res.status(400).json({error: "Request already pending!"});

        //push the request 
        document.requests.push({
            user: userID,
            type: req_type,
            status: "pending"
        })

        await document.save();

        res.status(201).json({
            message: "Request sent successfully",
            request: {
                user: userID,
                type: req_type,
                status: "pending"
            }
        })
    } catch (error) {
        next(error);
    }
}

const approveRequest = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const { user: requesting_userID, type, action } = req.body;
        
        if(!['view', 'edit'].includes(type)) 
            return res.status(400).json({error: "Invalid access type. Must contain 'view' or 'edit'"});
        
        if(!["approve", "reject"].includes(action))
            return res.status(400).json({error: "Invalid action type. Must contain 'approve' or 'reject'"});

        const document = await DocumentModel.findById(docID)
        if(!document)
            return res.status(404).json({error: "Document not found"});
    
        //owner check
        if(!(document.createdBy.toString() === req.user.id))
            return res.status(403).json({error: "Only the document owner can approve or reject requests"});
        
        const reqIndex = document.requests.findIndex(function(r) {
            return r.user.toString() === requesting_userID && r.type === type && r.status === 'pending'
        })
        if(reqIndex === -1) 
            return res.status(404).json({error: "Request not found"})

        if(action === "approve"){
            if(type === "view" && !document.access.view.includes(requesting_userID))
                document.access.view.push(requesting_userID)
            if(type === "edit" && !document.access.edit.includes(requesting_userID))
                document.access.edit.push(requesting_userID)
            document.requests[reqIndex].status = "approved"
        } else {
            document.requests[reqIndex].status = "rejected";
        }

        await document.save();
        res.status(200).json({
            message: `Request ${action}d successfully.`,
            update: document.requests[reqIndex]
        })
    } catch (error) {
        next(error);
    }
}
export {
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    requestAccess,
    approveRequest
}