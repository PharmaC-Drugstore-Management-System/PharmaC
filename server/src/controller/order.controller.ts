import orderService from "../services/order.services";
import paymentService from "../services/payment.service";
import { emitOrderToCustomerDisplay } from "../../ws";
const controller = {
  createOrder: async (req: any, res: any) => {
    try {
      const {
        items,
        employee_id,
        customer_id,
        total_amount,
        total_price,
        payment_method_types,
      } = req.body;
      console.log(req.body);
      if (!items || !employee_id) {
        return res.status(400).json({ error: "items id is required" });
      }
      const response = await orderService.create(
        items,
        employee_id,
        customer_id,
        total_amount,
        total_price
      );
      const currency = "thb";

      // Convert THB to satang (smallest unit) for Stripe
      // 100 THB = 10,000 satang (multiply by 100)
      const stripeAmount = Math.round(total_amount * 100);
      console.log(`Converting ${total_amount} THB to ${stripeAmount} satang for Stripe`);

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
        order_id : response.order?.order_id,
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
      emitOrderToCustomerDisplay({
        order: response.order,
        qrCode: qrcode.next_action?.promptpay_display_qr_code?.image_url_png,
        payment_intent_id: paymentIntent.id,
        timestamp: new Date().toISOString()
      });      return res.status(200).json({ status: true, data: filteredResponse });
    } catch (error: any) {
      console.log('Error',error.message)
      return res.status(500).json({ status: false, error: error.message });
    }
  },
};
export default controller;
