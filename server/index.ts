import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './src/app'; 

const PORT = process.env.PORT || 3000;

// Create HTTP server instead of using app.listen()
const server = createServer(app);


// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  console.log(`🔗 Access at http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server initialized`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
  console.log(`📱 Customer Display: http://localhost:5173/customer-payment`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
