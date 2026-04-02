import mongoose from "mongoose";
import DocumentModel from "../model/docModel.js";
import dotenv from "dotenv";
dotenv.config();

const docStateMap = new Map();

export const useSocket = (io) => {
    const presenceMap = new Map();  
    function emitPresence(documentId) {
        const docSessions = presenceMap.get(documentId);
        let users;
        if(docSessions) {
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
        socket.on("joinDoc", async ({documentId, userId}) => {
            if(!documentId || !userId)
                return;
            try {
                const document = await DocumentModel.findById(documentId).select("_id title content createdBy");
                if(!document) {
                    socket.emit("error", {message: "Document not found!"})
                    return;
                }
                if(!docStateMap.has(documentId)) {
                    docStateMap.set(
                        documentId, {
                            content: document.content,
                            lastUpdated: Date.now(),
                            saveTimer: null 
                    });
                }
                socket.join(documentId);
                socket.emit("doc:load", document);

                if(!presenceMap.has(documentId))
                    presenceMap.set(documentId, new Map());

                presenceMap.get(documentId).set(socket.id, {
                    userId,
                    lastActive: Date.now()
                });


                console.log(`Socket ${socket.id} joined document: ${documentId} as ${userId}`);   
                emitPresence(documentId);
            } catch (err) {
                console.log("Join Doc Error: ", err);
                socket.emit("error", {message: "Failed to load document"});
            }

            
        });
        socket.on("doc:change", ({ documentId, content, lastUpdated }) => {
            if (!documentId) return;
            
            const docState = docStateMap.get(documentId);
            if(!docState) return;

            if(lastUpdated < docState.lastUpdated) return;

            docState.content = content;
            docState.lastUpdated = lastUpdated;

            // send updated content to everyone else in the room
            socket.to(documentId).emit("doc:update", {content});
            if(docState.saveTimer) {
                clearTimeout(docState.saveTimer);
            }

            docState.saveTimer = setTimeout(async () => {
            try {
                await DocumentModel.findByIdAndUpdate(documentId, {content: docState.content});
                console.log(`Auto-saved doc ${documentId}`);
              } catch (err) {
                console.error("Auto-save failed:", err);
              }
            }, 2000);
        });

        socket.on("heartbeat", ({documentId}) => {
            const docSessions = presenceMap.get(documentId);
            if(!docSessions) return;
                const session = docSessions.get(socket.id);
            if(session) {
                session.lastActive = Date.now();
            //console.log(`Heartbeat from ${socket.id} for ${documentId}`); (testing purpose only)
            }
        });

        socket.on("leaveDoc", ({documentId}) => {
            const docSessions = presenceMap.get(documentId);
            if(!docSessions) return;
            if(docSessions.delete(socket.id)) //.delete returns true/false depending on if the doc is removed or not
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

        socket.on("disconnect", () => {
            console.log(`Socket ${socket.id} disconnected`);
            for(const [docId, docSessions] of presenceMap.entries()) { 
              /*
                map uses key, value structure => (docId, sessionData)
                hence to destructure we do [docId, docSessions]
              */
                if(docSessions.delete(socket.id)) {
                    console.log(`Removed ${socket.id} from document ${docId}`);
                    emitPresence(docId);
                }

                if(docSessions.size === 0) {//if the document room becomes empty on deletion then we delete it 
                    presenceMap.delete(docId);
                    const docState = docStateMap.get(docId);
                    if(docState?.saveTimer)
                        clearTimeout(docState.saveTimer);
                    docStateMap.delete(docId);
                }
            }
        });
    });

    //remove session if there is inactivity
    setInterval(() => {
        const currentTime = Date.now();
        const timeout = process.env.NODE_ENV === 'development' ? 30*1000 : 5*60*1000;
        for(const [docId, docSessions] of presenceMap.entries()) {
            let changed = false;
            for(const [clientId, data] of docSessions.entries()) {
                if(currentTime - data.lastActive > timeout) {
                docSessions.delete(clientId);
                changed = true;
                console.log(`Removed client ${clientId} from document ${docId} due to inactivity.`);
                }
            }
            if(changed)
                emitPresence(docId);
            if(docSessions.size === 0) {
                presenceMap.delete(docId);
                const docState = docStateMap.get(docId);
                if(docState?.saveTimer)
                    clearTimeout(docState.saveTimer);
                docStateMap.delete(docId);
            }
        }
    }, 30000);
}