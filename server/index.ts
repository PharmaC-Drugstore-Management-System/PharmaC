import dotenv from "dotenv";
dotenv.config();

import { createServer } from 'http';
import app from './src/app'; 
import { initWebSocket } from './ws';

const PORT = process.env.PORT || 5001;

const server = createServer(app);

// Initialize WebSocket
const io = initWebSocket(server);


// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  console.log(`🔗 Access at http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server initialized ${io}`);
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
 