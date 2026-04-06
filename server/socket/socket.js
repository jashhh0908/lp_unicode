import mongoose from "mongoose";
import DocumentModel from "../model/docModel.js";
import dotenv from "dotenv";
import versionModel from "../model/versionModel.js";
import { updateAndVersionDocument } from "../services/docService.js";
dotenv.config();

const docStateMap = new Map();

export const useSocket = (io) => {
    const presenceMap = new Map();
    function emitPresence(documentId) {
        const docSessions = presenceMap.get(documentId);
        let users;
        if (docSessions) {
            users = [...docSessions.entries()].map(([clientId, data]) => ({
                clientId,
                userId: data.userId,
                lastActive: data.lastActive
            }))
        } else {
            users = [];
        }

        io.to(documentId).emit("presence:update", {
            documentId,
            users
        });
    }

    io.on("connection", (socket) => {
        console.log("A new user has connected", socket.id);
        socket.on("joinDoc", async ({ documentId, userId }) => {
            if (!documentId || !userId)
                return;
            socket.userId = new mongoose.Types.ObjectId(userId);
            try {
                const document = await DocumentModel.findById(documentId).select("_id title content createdBy access"); // Note: Ensure you select the 'access' array!
                if (!document) {
                    socket.emit("error", { message: "Document not found!" })
                    return;
                }
                if (!document.createdBy.equals(userId) && !document.access.edit.includes(userId) && !document.access.view.includes(userId)) {
                    socket.emit("error", { message: "Access denied" });
                    return;
                }
                if (!docStateMap.has(documentId)) {
                    docStateMap.set(
                        documentId, {
                        title: document.title,
                        content: document.content,
                        lastUpdated: Date.now(),
                        saveTimer: null,
                        lastVersionTime: Date.now(),
                        lastVersionContent: document.content
                    });
                }
                socket.join(documentId);
                socket.emit("doc:load", document);

                if (!presenceMap.has(documentId))
                    presenceMap.set(documentId, new Map());

                presenceMap.get(documentId).set(socket.id, {
                    userId,
                    lastActive: Date.now()
                });


                console.log(`Socket ${socket.id} joined document: ${documentId} as ${userId}`);
                emitPresence(documentId);
            } catch (err) {
                console.log("Join Doc Error: ", err);
                socket.emit("error", { message: "Failed to load document" });
            }


        });
        socket.on("doc:change", ({ documentId, content, lastUpdated }) => {
            if (!documentId) return;

            const docState = docStateMap.get(documentId);
            if (!docState) return;

            if (lastUpdated < docState.lastUpdated) return;

            docState.content = content;
            docState.lastUpdated = lastUpdated;

            // send updated content to everyone else in the room
            socket.to(documentId).emit("doc:update", { content });
            if (docState.saveTimer) {
                clearTimeout(docState.saveTimer);
            }

            docState.saveTimer = setTimeout(async () => {
                console.log("attempting DB save");
                try {
                    const freshDoc = await DocumentModel.findById(documentId).select("title");
                    console.log("db updated");
                    const currentTime = Date.now();
                    const TIME_REQ_FOR_VERSION_CREATION = 5000;
                    const LENGTH_REQ_FOR_VERSION_CREATION = 50;
                    const timePassed = currentTime - docState.lastVersionTime;
                    const significantChange = Math.abs(docState.content.length - docState.lastVersionContent.length);
                    console.log("Version Check:", {
                        timePassed,
                        requiredTime: TIME_REQ_FOR_VERSION_CREATION,
                        significantChange,
                        requiredChange: LENGTH_REQ_FOR_VERSION_CREATION,
                        currentLength: docState.content.length,
                        lastVersionLength: docState.lastVersionContent.length
                    });
                    if (timePassed >= TIME_REQ_FOR_VERSION_CREATION && significantChange >= LENGTH_REQ_FOR_VERSION_CREATION && docState.content.trim().length > 0) {
                        const updatedDoc = await updateAndVersionDocument(
                            documentId,
                            socket.userId,
                            freshDoc.title,                // newTitle
                            docState.content,              // newContent
                            freshDoc.title,                // prevTitle (Socket doesn't change title yet)
                            docState.lastVersionContent    // prevContent
                        );

                        docState.title = updatedDoc.title;
                        docState.lastVersionContent = docState.content;
                        docState.lastVersionTime = currentTime;
                        console.log("Version created");
                    } else {
                        await DocumentModel.findByIdAndUpdate(documentId, { content: docState.content });
                        console.log("Version skipped (conditions not met)");
                    }
                    console.log(`Auto-saved doc ${documentId}`);
                } catch (err) {
                    console.error("Auto-save failed:", err);
                }
            }, 2000);
        });

        socket.on("heartbeat", ({ documentId }) => {
            const docSessions = presenceMap.get(documentId);
            if (!docSessions) return;
            const session = docSessions.get(socket.id);
            if (session) {
                session.lastActive = Date.now();
                //console.log(`Heartbeat from ${socket.id} for ${documentId}`); (testing purpose only)
            }
        });

        socket.on("leaveDoc", ({ documentId }) => {
            const docSessions = presenceMap.get(documentId);
            if (!docSessions) return;
            if (docSessions.delete(socket.id)) //.delete returns true/false depending on if the doc is removed or not
                console.log(`Socket ${socket.id} left document: ${documentId}`);
            socket.leave(documentId)
            emitPresence(documentId); //update the users still left in the room

            //update UI of the user who currently left showing active people except them
            let users = [];
            docSessions.forEach((data, clientId) => {
                users.push({
                    clientId: clientId,
                    userId: data.userId,
                    lastActive: data.lastActive
                });
            });
            socket.emit("presence:update", {
                documentId: documentId,
                users: users
            })


        });

        socket.on("disconnect", async () => {
            console.log(`Socket ${socket.id} disconnected`);
            for (const [docId, docSessions] of presenceMap.entries()) {
                /*
                  map uses key, value structure => (docId, sessionData)
                  hence to destructure we do [docId, docSessions]
                */
                if (docSessions.delete(socket.id)) {
                    console.log(`Removed ${socket.id} from document ${docId}`);
                    emitPresence(docId);
                }
                const docState = docStateMap.get(docId);
                console.log("Users in room:", docSessions.size);
                const SYS_ID = new mongoose.Types.ObjectId(process.env.SYS_ID);
                if (docSessions.size === 0) {//if the document room becomes empty we save final version, clear timeouts and delete memory states
                    if (docState && docState.content !== docState.lastVersionContent) {
                        const freshDoc = await DocumentModel.findById(docId).select("title");

                        const updatedDoc = await updateAndVersionDocument(
                            docId,
                            SYS_ID,
                            freshDoc.title,                // newTitle
                            docState.content,              // newContent
                            freshDoc.title,                // prevTitle (Socket doesn't change title yet)
                            docState.lastVersionContent    // prevContent
                        );

                        docState.title = updatedDoc.title;
                        docState.lastVersionContent = docState.content;
                        console.log("Session-end version created");
                    } else {
                        console.log("Version skipped (conditions not met)");
                    }
                    presenceMap.delete(docId);
                    if (docState?.saveTimer)
                        clearTimeout(docState.saveTimer);
                    docStateMap.delete(docId);
                }
            }
        });
    });

    //remove session if there is inactivity
    setInterval(() => {
        const currentTime = Date.now();
        const timeout = process.env.NODE_ENV === 'development' ? 30 * 1000 : 5 * 60 * 1000;
        for (const [docId, docSessions] of presenceMap.entries()) {
            let changed = false;
            for (const [clientId, data] of docSessions.entries()) {
                if (currentTime - data.lastActive > timeout) {
                    docSessions.delete(clientId);
                    changed = true;
                    console.log(`Removed client ${clientId} from document ${docId} due to inactivity.`);
                }
            }
            if (changed)
                emitPresence(docId);
            if (docSessions.size === 0) {
                presenceMap.delete(docId);
                const docState = docStateMap.get(docId);
                if (docState?.saveTimer)
                    clearTimeout(docState.saveTimer);
                docStateMap.delete(docId);
            }
        }
    }, 30000);
}