import { WebSocketServer } from "ws";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initWebSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"], // Allow both transports
    allowEIO3: true,
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);
    console.log("📊 Total connections:", io.sockets.sockets.size);

    // Test connection
    socket.emit("connection-test", {
      message: "WebSocket connected successfully!",
      timestamp: new Date().toISOString(),
      socketId: socket.id,
    });

    // Handle customer display join
    socket.on("join-customer-display", () => {
      console.log("📱 Customer display joined:", socket.id);
      socket.join("customer-display");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Client disconnected:", socket.id, "Reason:", reason);
      console.log("📊 Total connections:", io.sockets.sockets.size);
    });

    // Listen for test messages from frontend
    socket.on("ping", (data) => {
      console.log("📨 Received ping from client:", data);
      socket.emit("pong", {
        message: "Server received your ping!",
        timestamp: new Date().toISOString(),
      });
    });
  });

  return io;
};

// Function to emit order with QR code to customer display
export function emitOrderToCustomerDisplay(orderData: any) {
  if (!io) {
    console.error("❌ Socket.IO not initialized");
    return;
  }

  console.log("📤 Emitting order to customer display:", orderData);
  
  // Emit to all clients in customer-display room
  io.to("customer-display").emit("new-order-qr", orderData);
  
  // Also emit to all connected clients as fallback
  io.emit("new-order-qr", orderData);
  
  // Emit notification to admin/staff for new orders
  emitNotificationToAdmins({
    type: 'NEW_ORDER',
    order: orderData.order,
    timestamp: orderData.timestamp
  });
}

// Function to emit notifications to admin/staff
export function emitNotificationToAdmins(notificationData: any) {
  if (!io) {
    console.error("❌ Socket.IO not initialized");
    return;
  }

  console.log("🔔 Emitting notification to admins:", notificationData);
  
  // Emit to all connected clients (admins/staff)
  io.emit("admin-notification", notificationData);
}

// Function to emit payment status updates
export function emitPaymentStatusUpdate(statusData: any) {
  if (!io) {
    console.error("❌ Socket.IO not initialized");
    return;
  }

  console.log("💳 Emitting payment status update:", statusData);
  io.to("customer-display").emit("payment-status-update", statusData);
  io.emit("payment-status-update", statusData);
}

// Legacy broadcast function (kept for compatibility)
export function broadcast(data: any) {
  if (!io) return;
  
  console.log("📡 Legacy broadcast:", data);
  io.emit("legacy-broadcast", data);
}
