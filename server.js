import express from "express";
import dotenv from "dotenv"
import connectDB from "./config/db.js";
import siteRoute from "./routes/siteRoutes.js";

const PORT = process.env.PORT || 5000;
dotenv.config();

const app = express();
connectDB();

app.use(express.json());

app.use('/', siteRoute);

async function startServer() {
  await connectDB();   
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();