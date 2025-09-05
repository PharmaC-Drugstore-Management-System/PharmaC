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
          await paymentService.updateStatus(order_id)
        }
        
        // Only emit WebSocket event if not skipped
        if (!skipWebSocket) {
          // Emit WebSocket event for real-time updates
          const statusData = {
            paymentIntentId: pi,
            orderId: order_id,
            status: response,
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

};

export default controller;
