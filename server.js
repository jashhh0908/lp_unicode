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

//middleware
app.use(cookieParser());
app.use(express.json());

if (NODE_ENV == 'development'){
  app.use(morgan("tiny"));
}

//socket.io
const presenceMap = new Map();  
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
    
  });

  socket.on("heartbeat", ({documentId}) => {
    const docSessions = presenceMap.get(documentId);
    if(!docSessions) return;
    const session = docSessions.get(socket.id);
    if(session) {
      session.lastActive = Date.now();
      console.log(`Heartbeat from ${socket.id} for ${documentId}`);
    }
  });

  socket.on("leaveDoc", ({documentId}) => {
    const docSessions = presenceMap.get(documentId);
    if(!docSessions) return;
    if(docSessions.delete(socket.id))
      console.log(`Socket ${socket.id} left document: ${documentId}`)
    socket.leave(documentId)
  });
});

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