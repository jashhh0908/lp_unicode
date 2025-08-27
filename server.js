import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
const PORT = process.env.PORT || 5000;
dotenv.config();

const app = express();
connectDB();

app.use(express.json());

app.get('/', (req, res) => { //test message
    res.json({
        message: "server running"
    })
})

async function startServer() {
  await connectDB();   
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();