import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import path from "path";
import http from "http";

import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import siteRoute from "./routes/siteRoutes.js";
import profileRoute from "./routes/profileRoutes.js";
import docRoute from "./routes/docRoutes.js";
import { log } from "console";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config();



//socket.io

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
  socket.on("joinDoc", ({documentId, userId}) => {
    if(!documentId || !userId)
      return;
    socket.join(documentId);
    if(!presenceMap.has(documentId))
      presenceMap.set(documentId, new Map());

    presenceMap.get(documentId).set(socket.id, {
      userId,
      lastActive: Date.now()
    });
    
    console.log(`Socket ${socket.id} joined document: ${documentId} as ${userId}`);   
    emitPresence(documentId);
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
    emitPresence(documentId);
  });
  
  socket.on("disconnect", ({documentId}) => {
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

      if(docSessions.size === 0) //if the document room becomes empty on deletion then we delete it 
        presenceMap.delete(docId);
    }
  });
});

//remove session if there is inactivity
setInterval(() => {
  const currentTime = Date.now();
  const timeout = 30*1000;
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
    }
  }
}, 30000);

//middleware
app.use(cookieParser());
app.use(express.json());

if (NODE_ENV == 'development'){
  app.use(morgan("tiny"));
}

app.use(express.static(path.resolve("./public")));

//global error handler
app.use((err, req, res, next) => {
  logger.error(err.message);   
  res.status(500).json({ error: "Something went wrong!" }); 
});

app.use('/', siteRoute);
app.use('/profile', profileRoute);
app.use('/document', docRoute);

async function startServer() {
  await connectDB();   

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();