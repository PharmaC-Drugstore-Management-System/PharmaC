import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./src/app";
import { initWebSocket } from "./ws"; // adjust path if needed

const PORT = Number(process.env.PORT) || 3000;

const server = createServer(app);
initWebSocket(server); // <-- attach WS to the server that will listen

server.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  console.log(`🔗 Access at http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
  console.log(`📱 Customer Display: http://localhost:5173/customer-payment`);
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});
