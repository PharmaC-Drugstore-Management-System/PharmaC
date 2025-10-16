import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
// Middleware

import apiRouter from "./routes/index.routes"; // ✅ import routes
import { initWebSocket } from "../ws";

const app = express();

// Build allowed origins from env (comma-separated), include common defaults
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://pharmac.sit.kmutt.ac.th",
];
const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...
  defaultOrigins,
  ...envOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin or server-side calls
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, true); // relax for now; tighten by rejecting if needed
    },
    credentials: true,
  })
);
// Increase payload limit for base64 images (signatures, etc.)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// serve uploaded files
import path from 'path';
const uploadsPath = path.join(process.cwd(), 'uploads');
console.log('📁 Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// ✅ ใส่ routes ตรงนี้!
app.use("/api", apiRouter);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Server is healthy" });
});
const server = http.createServer(app);
initWebSocket(server);
console.log("Ws connected")
// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ Error:", err);
  res.status(500).json({ error: "Something broke!" });
});

export default app;
