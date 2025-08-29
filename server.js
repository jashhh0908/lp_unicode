import express from "express";
import dotenv from "dotenv";
import logger from "./config/logger.js";
import morgan from "morgan";
import connectDB from "./config/db.js";
import siteRoute from "./routes/siteRoutes.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config();

const app = express();

//middleware
app.use(express.json());

if (NODE_ENV == 'development'){
  app.use(morgan("tiny"));
}

//global error handler
app.use((err, req, res, next) => {
  logger.error(err.message);   
  res.status(500).json({ error: "Something went wrong!" }); 
});


app.use('/', siteRoute);

async function startServer() {
  await connectDB();   
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();