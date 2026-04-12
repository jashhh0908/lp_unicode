import mongoose from "mongoose";
import { diffWords, diffLines } from "diff";
import userModel from "../model/userModel.js";
import DocumentModel from "../model/docModel.js";
import versionModel from "../model/versionModel.js";
import mail from "../utils/mailer.js";
import PDFDocument from "pdfkit";
import { updateAndVersionDocument } from "../services/docService.js";
import { io } from "../server.js";

const createDocument = async (req, res, next) => {
    try {

        const { title, content } = req.body;
        const userID = new mongoose.Types.ObjectId(req.user.id);
        if (!title)
            return res.status(400).json({ error: "Title is required" });
        const newDocument = await DocumentModel.create({
            title,
            content: content || "",
            createdBy: userID,
            access: { view: [userID], edit: [userID] },
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
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (!document.access.edit.includes(userID))
            return res.status(403).json({ error: "You don't have permission to edit this document" });

        //find the all versions of the document
        const updatedDoc = await updateAndVersionDocument(
            docID,
            userID,
            req.body.title,         // newTitle
            req.body.content,       // newContent
            document.title,         // prevTitle
            document.content        // prevContent
        );
        res.status(200).json({
            message: "Document updated and previous version saved successfully",
            document: updatedDoc
        });
    } catch (error) {
        next(error);
    }
}

const deleteDocument = async (req, res, next) => {
    try {
        const userID = new mongoose.Types.ObjectId(req.user.id);
        const docID = req.params.id;
        const document = await DocumentModel.findById(docID);
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (!document.createdBy.equals(userID))
            return res.status(403).json({ error: "You don't have permission to delete this document" });
        const deleted = await DocumentModel.findByIdAndDelete(docID);
        if (deleted)
            return res.status(200).json({ message: "Document deleted successfully" });
        else
            return res.status(500).json({ error: "Document deletion failed" });
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
        if (!['view', 'edit'].includes(req_type))
            return res.status(400).json({ error: "Invalid access type. Must contain 'view' or 'edit'" });
        const document = await DocumentModel.findById(docID).populate("createdBy", "email name");
        if (!document)
            return res.status(404).json({ error: "Document not found" })

        if (req_type === 'view' && document.access.view.includes(userID))
            return res.status(400).json({ error: "You already have viewing access to this document" });

        if (req_type === 'edit' && document.access.edit.includes(userID))
            return res.status(400).json({ error: "You already have editing access to this document" });

        //check if the request already exists
        const exists = document.requests.find(function (r) {
            return r.user.toString() === userID && r.type === req_type && r.status === "pending";
        })
        if (exists)
            return res.status(400).json({ error: "Request already pending!" });

        //push the request 
        document.requests.push({
            user: userID,
            type: req_type,
            status: "pending"
        })

        await document.save();

        io.to(docID).emit("doc:access:request", { docID });
        const requesting_user = await userModel.findById(userID);

        await mail(
            document.createdBy.email,
            "REQUESTING ACCESS!",
            `<p><b>Name: ${requesting_user.name}</b> (${requesting_user.email}) has requested <b>${req_type}</b> access to your document "<b>${document.title}</b>".</p>
            <p>Please either accept or reject this request.</p>
            `
        )
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

        if (!['view', 'edit'].includes(type))
            return res.status(400).json({ error: "Invalid access type. Must contain 'view' or 'edit'" });

        if (!["approve", "reject"].includes(action))
            return res.status(400).json({ error: "Invalid action type. Must contain 'approve' or 'reject'" });

        const document = await DocumentModel.findById(docID)
        if (!document)
            return res.status(404).json({ error: "Document not found" });

        //owner check
        if (!(document.createdBy.toString() === req.user.id))
            return res.status(403).json({ error: "Only the document owner can approve or reject requests" });

        const reqIndex = document.requests.findIndex(function (r) {
            return r.user.toString() === requesting_userID && r.type === type && r.status === 'pending'
        })
        if (reqIndex === -1)
            return res.status(404).json({ error: "Request not found" })

        if (action === "approve") {
            if (type === "view" && !document.access.view.includes(requesting_userID))
                document.access.view.push(requesting_userID)
            if (type === "edit" && !document.access.edit.includes(requesting_userID))
                document.access.edit.push(requesting_userID)
            document.requests[reqIndex].status = "approved"
        } else {
            document.requests[reqIndex].status = "rejected";
        }

        await document.save();
        io.to(docID).emit("doc:access:update", { docID });
        res.status(200).json({
            message: `Request ${action}d successfully.`,
            update: document.requests[reqIndex]
        })
    } catch (error) {
        next(error);
    }
}

const addUserAccess = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const { email, type } = req.body;

        if (!['view', 'edit'].includes(type))
            return res.status(400).json({ error: "Invalid access type. Must contain 'view' or 'edit'" });

        const document = await DocumentModel.findById(docID)
        if (!document)
            return res.status(404).json({ error: "Document not found" });

        //owner check
        if (!(document.createdBy.toString() === req.user.id))
            return res.status(403).json({ error: "Only the document owner can grant access" });

        const User_toAdd = await userModel.findOne({email})
        if (!User_toAdd)
            return res.status(400).json({ error: "User not found" })

        const userID_toAdd = User_toAdd._id;
        if (type === "view") {
            if (!document.access.view.includes(userID_toAdd)) {
                document.access.view.push(userID_toAdd)
            } else {
                return res.status(400).json({ error: "User already has viewing access" });
            }
        }

        if (type === "edit") {
            if (!document.access.edit.includes(userID_toAdd)) {
                document.access.edit.push(userID_toAdd)
            } else {
                return res.status(400).json({ error: "User already has editing access" });
            }
        }

        await document.save();
        io.to(docID).emit("doc:access:update", { docID });
        res.status(200).json({
            message: `${type}ing access given successfully`,
            userID: userID_toAdd,
            name: User_toAdd.name
        })
    } catch (error) {
        next(error);
    }
}

const removeUserAccess = async (req, res, next) => {
    try {
        const docId = req.params.id;
        const { email, type } = req.body
        const document = await DocumentModel.findById(docId)
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (!(document.createdBy.toString() === req.user.id))
            return res.status(403).json({ error: "Only the document owner can remove access" });

        const userToRemove = await userModel.findOne({email});
        if (!userToRemove)
            return res.status(400).json({ error: "User not found" })

        const userIdToRemove = userToRemove._id;
        if (type === "view") {
            if (document.access.view.includes(userIdToRemove)) {
                document.access.view.pull(userIdToRemove)
            } else {
                return res.status(400).json({ error: "User doesn't have viewing access" });
            }
        }

        if (type === "edit") {
            if (document.access.edit.includes(userIdToRemove)) {
                document.access.edit.pull(userIdToRemove)
            } else {
                return res.status(400).json({ error: "User doesn't have editing access" });
            }
        }

        await document.save();
        io.to(docId).emit("doc:access:update", { docId });
        res.status(200).json({
            message: `${type}ing access revoked successfully`,
            userID: userIdToRemove,
            name: userToRemove.name
        });
    } catch (error) {
        next(error);
    }
}

const getDocCollaborators = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const document = await DocumentModel.findById(docID)
            .populate("createdBy", "name email")
            .populate("access.view", "name email")
            .populate("access.edit", "name email")
            .populate("requests.user", "name email");

        if (!document) return res.status(404).json({message: "Document not found"});

        res.status(200).json({
            owner: document.createdBy,
            collaborators: {
                view: document.access.view,
                edit: document.access.edit
            },
            requests: document.requests
        })
    } catch (error) {
        next(error);
    }
}

const getDocHistory = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const userID = req.user.id;

        const document = await DocumentModel.findById(docID);
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (!document.createdBy.equals(userID.toString()) &&
            !document.access.edit.includes(userID.toString()) &&
            !document.access.view.includes(userID.toString())
        )
            return res.status(403).json({ error: "You cannot view history as you are not a collaborator on this document" });

        const doc_version = await versionModel.findOne({ document: docID });
        if (!doc_version)
            return res.status(404).json({ error: "No version history found" });

        const sorted_doc_Version = doc_version.versions.sort(
            (a, b) => new Date(b.editedAt) - new Date(a.editedAt)
        );

        res.status(200).json({
            message: "Version history fetch successful!",
            sorted_doc_Version
        })
    } catch (error) {
        next(error)
    }
}

const restoreVersion = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const versionID = req.params.versionID;
        const userID = req.user.id;
        const user = await userModel.findById(userID);
        const document = await DocumentModel.findById(docID);
        if (!document)
            return res.status(404).json({ error: "Document not found" });

        if (!document.createdBy.equals(userID.toString()) &&
            !document.access.edit.includes(userID.toString())
        )
            return res.status(403).json({ error: "You cannot view history as you are not a collaborator on this document" });
        const doc_version = await versionModel.findOne({ document: docID });
        if (!doc_version)
            return res.status(404).json({ error: "No version history found" });

        const version_to_restore = doc_version.versions.id(versionID)
        //.id is a special mongoose helper function which searches through the array 
        let versionNumber = doc_version.versions.length + 1;
        try {
            const previousVersion = {
                versionNumber,
                editedBy: userID,
                content: {
                    title: document.title,
                    content: document.content
                }
            };

            doc_version.versions.push(previousVersion)
            await doc_version.save();
        } catch (error) {
            console.log("Error in saving version: ", error);
            throw error;
        }
        document.title = version_to_restore.content.title;
        document.content = version_to_restore.content.content;
        await document.save();
        console.log(`Document ${docID} restored to version ${version_to_restore.versionNumber}'s content by user ${user.name} `)
        res.status(200).json({ message: "Document restored successfully" })
    } catch (error) {
        next(error);
    }
}

const compareVersions = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const v1 = req.params.v1;
        const v2 = req.params.v2;
        const userID = req.user.id;
        const document = await DocumentModel.findById(docID);
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (!document.createdBy.equals(userID) &&
            !document.access.edit.includes(userID.toString()) &&
            !document.access.view.includes(userID.toString())
        )
            return res.status(403).json({ error: "You cannot compare versions as you are not a collaborator on this document" });

        const doc_version = await versionModel.findOne({ document: docID });
        if (!doc_version)
            return res.status(404).json({ error: "No version history found" });

        const version1 = doc_version.versions.id(v1);
        const version2 = doc_version.versions.id(v2);

        if (!version1 || !version2)
            return res.status(404).json({ error: "Version(s) not found" });

        const v1_content = version1.content;
        const v2_content = version2.content;

        //find difference between title and content of both versions
        const titleDiff = diffWords(v1_content.title, v2_content.title);
        const contentDiff = diffLines(v1_content.content, v2_content.content);

        res.status(200).json({
            message: "Versions compared successfully",
            createdBy: document.createdBy,
            v1: version1.versionNumber,
            v2: version2.versionNumber,
            differences: {
                title: titleDiff,
                content: contentDiff
            }
        });

    } catch (error) {
        next(error);
    }
}


const exportToPDF = async (req, res, next) => {
    try {
        const docID = req.params.id;
        const userID = req.user.id;
        const document = await DocumentModel.findById(docID);
        if (!document)
            return res.status(404).json({ error: "Document not found" });
        if (!document.createdBy.equals(userID) &&
            !document.access.edit.includes(userID.toString()) &&
            !document.access.view.includes(userID.toString())
        )
            return res.status(403).json({ error: "You cannot export this document as you are not a collaborator on it" });

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Disposition', `attachment; filename="${document.title}.pdf"`);
        res.setHeader('Content-Type', 'application/pdf');
        pdfDoc.pipe(res);
        pdfDoc.fontSize(20).text(document.title, { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.fontSize(12).text(document.content);
        pdfDoc.end();
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
    approveRequest,
    addUserAccess,
    removeUserAccess,
    getDocCollaborators,
    getDocHistory,
    restoreVersion,
    compareVersions,
    exportToPDF
}