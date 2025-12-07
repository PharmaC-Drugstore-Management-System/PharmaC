import orderService from "../services/order.services";
import paymentService from "../services/payment.service";
import { emitOrderToCustomerDisplay, emitNotificationToAdmins, emitOrderStatusUpdate } from "../../ws";
import e from "express";
const controller = {
  createOrder: async (req: any, res: any) => {
    try {
      const {
        items,
        employee_id,
        point,
        customer_id,
        total_amount,
        total_price,
        payment_method_types,
        payment_method,
        discount_amount,
        discount_type,
        points_used
      } = req.body;
      console.log(req.body);
      console.log('Employee ID:', employee_id);
      console.log('Payment Method:', payment_method);
      console.log('Discount Info:', { discount_amount, discount_type, points_used });
      if (!items || !employee_id) {
        return res.status(400).json({ error: "items id is required" });
      }
      const response = await orderService.create(
        items,
        employee_id,
        point,
        customer_id,
        total_amount,
        total_price,
        discount_amount,
        discount_type,
        points_used
      );

      // Handle CASH payment - no Stripe needed
      if (payment_method === 'CASH') {
        console.log('💵 Cash payment - skipping Stripe integration');
        
        if (!response.order) {
          throw new Error('Failed to create order');
        }
        
        // Update order status to PAID immediately for cash (this also reduces stock)
        console.log('⏳ Updating order status to PAID and reducing stock...');
        const updatedOrder = await paymentService.updateStatus(response.order.order_id);
        console.log('✅ Order status updated to PAID, stock reduced');
        
        // NOW emit notifications AFTER status is PAID
        console.log('🔔 Emitting cash payment notification to admins');
        emitNotificationToAdmins({
          type: 'CASH_PAYMENT',
          order: {
            ...updatedOrder, // Use updated order with PAID status
            discount_amount: discount_amount || 0,
            discount_type: discount_type || 'none',
            points_used: points_used || 0,
            payment_method: 'CASH'
          },
          timestamp: new Date().toISOString()
        });
        
        // Emit order status update for real-time UI refresh
        console.log('📦 Emitting order status update');
        emitOrderStatusUpdate({
          order_id: updatedOrder.order_id,
          status: 'paid',
          payment_method: 'CASH',
          timestamp: new Date().toISOString()
        });
        
        return res.status(200).json({ 
          status: true, 
          order: updatedOrder, // Return updated order
          message: 'Cash order created successfully'
        });
      }

      // Handle QR/PromptPay payment - use Stripe
      console.log('📱 QR Payment - creating Stripe payment intent');
      const currency = "thb";

      // Convert THB to satang (smallest unit) for Stripe
      // 100 THB = 10,000 satang (multiply by 100)
      const stripeAmount = Math.round(total_amount * 100);
      console.log(
        `Converting ${total_amount} THB to ${stripeAmount} satang for Stripe`
      );

      const stripeItems = response.order?.carts
        ? response.order.carts.map((cart: any) => ({
            product_id: cart.product_id,
            amount: Math.round(cart.unit_price * 100), // Convert individual prices to satang too
            product_name: cart.product?.product_name || "Unknown Product",
          }))
        : [];
      console.log("Stripe Items ", stripeItems);
      const paymentIntent = await paymentService.intents(
        stripeAmount, // Use converted amount in satang
        currency,
        payment_method_types,
        stripeItems
      );
      const paymentType = `${paymentIntent.payment_method_types}`;
      if (paymentIntent.receipt_email === null) {
        paymentIntent.receipt_email = "Notfound@gmail.com";
      }
      const paymentMethod = await paymentService.medtod(
        paymentIntent.customer,
        paymentType,
        paymentIntent.receipt_email
      );
      const qrcode = await paymentService.qr(
        paymentMethod.id,
        paymentIntent.id
      );

      const filteredResponse = {
        order_id: response.order?.order_id,
        pi: paymentIntent.id,
        qrcode_url:
          qrcode.next_action?.promptpay_display_qr_code?.image_url_png,
        customer_email: paymentIntent.receipt_email || null,
        items: paymentIntent.metadata?.items
          ? JSON.parse(paymentIntent.metadata.items)
          : [],
        payment_type: paymentIntent.payment_method_types,
      };

      // Emit order to customer display via Socket.IO
      console.log('📤 Emitting new order via WebSocket:', {
        order_id: response.order?.order_id,
        total_amount: response.order?.total_amount,
        customer_id: response.order?.customer_id,
        customer_name: response.order?.customer?.name || 'ลูกค้าทั่วไป',
        discount_amount: discount_amount || 0,
        discount_type: discount_type || 'none',
        points_used: points_used || 0
      });
      
      emitOrderToCustomerDisplay({
        order: {
          ...response.order,
          discount_amount: discount_amount || 0,
          discount_type: discount_type || 'none',
          points_used: points_used || 0
        },
        qrCode: qrcode.next_action?.promptpay_display_qr_code?.image_url_png,
        payment_intent_id: paymentIntent.id,
        timestamp: new Date().toISOString(),
      });
      return res.status(200).json({ status: true, data: filteredResponse });
    } catch (error: any) {
      console.log("Error", error.message);
      return res.status(500).json({ status: false, error: error.message });
    }
  },
  list: async (req: any, res: any) => {
    try {
      const response = await orderService.list()
      if(!response) throw new Error
      return res.status(200).json({status : true, data: response})
    } catch (error : any) {
        console.log("Error", error.message);
      return res.status(500).json({ status: false, error: error.message });
    }
  },

  getRecentOrders: async (req: any, res: any) => {
    try {
      // Get orders from last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const response = await orderService.getRecentOrders(twentyFourHoursAgo);
      
      return res.status(200).json({
        success: true, 
        orders: response,
        count: response?.length || 0
      });
    } catch (error: any) {
      console.log("Error getting recent orders:", error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // เพิ่ม endpoint ใหม่สำหรับ latest orders โดยไม่จำกัดวันที่
  getLatestOrders: async (req: any, res: any) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      console.log('🔍 Getting latest orders with limit:', limit);

      const response = await orderService.getLatestOrders(limit);
      
      return res.status(200).json({
        success: true, 
        orders: response,
        count: response?.length || 0
      });
    } catch (error: any) {
      console.log("Error getting latest orders:", error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Cancel order
  cancelOrder: async (req: any, res: any) => {
    try {
      const { order_id, payment_intent_id } = req.body;
      console.log('🚫 Cancelling order:', { order_id, payment_intent_id });

      if (!order_id) {
        return res.status(400).json({ 
          success: false, 
          error: "order_id is required" 
        });
      }

      // Update order status to CANCELLED
      const response = await orderService.cancelOrder(order_id);
      
      // If there's a payment intent, cancel it on Stripe too
      if (payment_intent_id) {
        try {
          await paymentService.cancelPaymentIntent(payment_intent_id);
          console.log('✅ Payment intent cancelled on Stripe');
        } catch (stripeError) {
          console.error('⚠️ Failed to cancel Stripe payment:', stripeError);
          // Continue even if Stripe cancellation fails
        }
      }

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        order: response
      });
    } catch (error: any) {
      console.log("Error cancelling order:", error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },


};
export default controller;
