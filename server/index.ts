import dotenv from "dotenv";
dotenv.config();

import { createServer } from 'http';
import app from './src/app'; 
import { initWebSocket } from './ws';
import { startScheduler } from './src/utils/scheduler.utils';

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Set timeout for long-running requests (e.g., ML predictions)
// 10 minutes = 600,000 ms
server.timeout = 600000;
server.keepAliveTimeout = 610000;
server.headersTimeout = 620000;

// Initialize WebSocket
const io = initWebSocket(server);


// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  console.log(`🔗 Access at http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server initialized ${io}`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
  console.log(`📱 Customer Display: http://localhost:5173/customer-payment`);
  
  // Start the scheduler for checking expired orders
  startScheduler();
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed successfully");
    process.exit(0);
  });
});
 