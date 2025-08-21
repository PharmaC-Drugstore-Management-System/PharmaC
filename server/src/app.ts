import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middleware

import apiRouter from "./routes/index.routes"; // ✅ import routes

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// serve uploaded files
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ ใส่ routes ตรงนี้!
app.use("/", apiRouter);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: "Something broke!" });
});

export default app;
