import paymentService from "../services/payment.service";
import { emitPaymentStatusUpdate } from "../../ws";

const controller = {
  paymentIntents: async (req: any, res: any) => {
    try {
      const { amount, currency, payment_type } = req.body;

      // Check if required parameters are present
      if (!amount || !currency || !payment_type) {
        return res.status(400).json({
          error:
            "Missing required parameters: amount, currency, or payment_type",
        });
      }

      const response = await paymentService.intents(amount, currency, payment_type)
      return res.status(200).json({status:true, data:response})

    } catch (error) {
      res.status(500).json({
        status: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  },
  paymentMethod: async(req: any, res: any) => {
    try {
    const { customer, type, email } = req.body;

    // Check if required parameters are present
    if (!customer || !type || !email) {
      return res.status(400).json({
        error: "Missing required parameters: customer, type, or email",
      });
    }

    const response = await paymentService.medtod(customer, type, email)
    return res.status(200).json({status:true, data:response})

    } catch (error) {
      res.status(500).json({
        status: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  },
  paymentQrcode : async(req:any, res:any) => {
    try {
        const {payment_method, pi} = req.body
        const response = await paymentService.qr(payment_method,pi)
        return res.status(200).json({status:true,data:response})

    } catch (error) {
        res.status(500).json({
        status: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  },
  paymentCheck: async (req: any, res: any) => {
      try {
        const { pi, order_id, skipWebSocket = false } = req.body;
        const response = await paymentService.check(pi);
        console.log(response)
        if(response === 'succeeded'){
          console.log("YES SUCCEEDED")
          await paymentService.updateStatus(order_id)

        }
        
        // Only emit WebSocket event if not skipped
        if (!skipWebSocket) {
          // Emit WebSocket event for real-time updates
          const statusData = {
            paymentIntentId: pi,
            order_id: order_id, // Changed from orderId to order_id to match frontend
            status: response === 'succeeded' ? 'completed' : response, // Map 'succeeded' to 'completed'
            timestamp: new Date().toISOString()
          };
          
          console.log("💳 Emitting payment status update via WebSocket:", statusData);
          emitPaymentStatusUpdate(statusData);
        } else {
          console.log("🔇 Skipping WebSocket emission for database-only update");
        }
        
        return res.status(200).json({ success: true, status: response });
      } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
      }
    },

  checkExpiredOrders: async (req: any, res: any) => {
    try {
      const result = await paymentService.checkExpiredOrders();
      
      console.log(`⏰ Expired orders check completed:`, result);
      
      return res.status(200).json({ 
        success: true, 
        data: result,
        message: `Checked ${result.checked} orders, cancelled ${result.cancelled} expired orders`
      });
    } catch (error: any) {
      console.error("Error checking expired orders:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  cancelOrder: async (req: any, res: any) => {
    try {
      const { order_id } = req.body;
      
      if (!order_id) {
        return res.status(400).json({ 
          success: false, 
          error: "order_id is required" 
        });
      }

      const result = await paymentService.cancelOrder(order_id);
      
      // Emit WebSocket event for real-time updates
      const statusData = {
        order_id: order_id,
        status: 'cancelled',
        timestamp: new Date().toISOString()
      };
      
      console.log("❌ Emitting order cancellation via WebSocket:", statusData);
      emitPaymentStatusUpdate(statusData);
      
      return res.status(200).json({ 
        success: true, 
        data: result,
        message: `Order ${order_id} has been cancelled`
      });
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

};

export default controller;
