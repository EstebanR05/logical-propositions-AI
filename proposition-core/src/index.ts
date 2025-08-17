import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import inferenceRoutes from "./routes/inference.routing";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use("/api/verify-inference", inferenceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port localhost:${PORT}`));
