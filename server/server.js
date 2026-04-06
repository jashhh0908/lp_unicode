import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import http from "http";

import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import siteRoute from "./routes/siteRoutes.js";
import profileRoute from "./routes/profileRoutes.js";
import docRoute from "./routes/docRoutes.js";
import chatbotRoute from './routes/chatbotRoutes.js';
import { useSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH"],
        credentials: true
    }
});
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config();

//socket.io
useSocket(io);

//middleware
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"], credentials: true }));
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
app.use('/chatbot', chatbotRoute);

async function startServer() {
    await connectDB();   

    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
};

startServer();