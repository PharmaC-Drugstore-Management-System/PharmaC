import Stripe from "stripe";
import prisma from "../utils/prisma.utils";
const stripe = new Stripe(
  "sk_test_51RzJdJCxeJXS3A6fHM2HR8ZiMdhdhz2BVVp4YPd0bFJewsPvPZSrUCMdzkV8k7uYtZ9OH9THa5FHTHa3ep7syTms003X1MWn9v" // ENV
);
const paymentService = {
  intents: async (amount: any, currency: any, payment_type: any, items?: any[]) => {
    try {
      // Create a Payment Intent using the Stripe API
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method_types: [payment_type],
        metadata: {
          ...(items && {
            item_count: items.length.toString(),
            items: JSON.stringify(items),
          }),
        },
      });
      console.log("paymentIntent -> ",paymentIntent)
      // Send the payment intent object back in the response
      return paymentIntent;
    } catch (error) {
      // Handle errors from the Stripe API or network issues
      throw error;
    }
  },
  medtod: async (customer: any, type: any, email: any) => {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: type,
        billing_details: {
          email: email,
          name: customer,
        },
      });
      return paymentMethod;
    } catch (error) {
      throw error;
    }
  },
  qr: async (payment_method: any, pi: any) => {
    try {
      // Generate a QR code for the payment using Stripe's Payment Links API
      const confirmIntent = await stripe.paymentIntents.confirm(pi, {
        payment_method: payment_method,
      });

      // The paymentLink.url can be used to generate a QR code using a QR code library or service
      return confirmIntent;
    } catch (error) {
      throw error;
    }
  },
  check: async (pi: any) => {
    try {
      const retrieveIntent = await stripe.paymentIntents.retrieve(`${pi}`);
      if(retrieveIntent)
        
      return retrieveIntent.status;
    } catch (error) {}
  },
  updateStatus: async(order_id: number | string) => {
    try {
      // Ensure order_id is a number since Prisma expects Int
      const orderIdNum = typeof order_id === 'string' ? parseInt(order_id) : order_id;
      
      if (isNaN(orderIdNum)) {
        throw new Error(`Invalid order_id: ${order_id}`);
      }
      
      console.log(`💳 Updating order ${orderIdNum} status to PAID`);
      const update = await prisma.order.update({
        where: { order_id: orderIdNum },
        data: { status: "PAID" },
      });
      console.log(`✅ Successfully updated order ${orderIdNum} status to PAID`);
      return update;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error; // Re-throw the error so the caller knows it failed
    }
  },
  
  checkExpiredOrders: async() => {
    try {
      // Get all PENDING orders
      const pendingOrders = await prisma.order.findMany({
        where: {
          status: "PENDING"
        },
        select: {
          order_id: true,
          date: true
        }
      });

      const expiredOrderIds: number[] = [];
      const now = new Date();

      for (const order of pendingOrders) {
        if (order.date) {
          // Check if order is older than 10 minutes (600000 ms)
          const orderTime = new Date(order.date).getTime();
          const timeDiff = now.getTime() - orderTime;
          
          if (timeDiff > 600000) { // 10 minutes in milliseconds
            expiredOrderIds.push(order.order_id);
          }
        }
      }

      // Update all expired orders to CANCELLED
      if (expiredOrderIds.length > 0) {
        console.log(`⏰ Cancelling ${expiredOrderIds.length} expired orders:`, expiredOrderIds);
        await prisma.order.updateMany({
          where: {
            order_id: { in: expiredOrderIds }
          },
          data: {
            status: "CANCELLED"
          }
        });
        console.log(`✅ Successfully cancelled ${expiredOrderIds.length} expired orders`);
      }

      return {
        checked: pendingOrders.length,
        cancelled: expiredOrderIds.length,
        cancelledOrderIds: expiredOrderIds
      };
    } catch (error) {
      console.error("Error checking expired orders:", error);
      throw error;
    }
  },

  cancelOrder: async(order_id: number | string) => {
    try {
      const orderIdNum = typeof order_id === 'string' ? parseInt(order_id) : order_id;
      
      if (isNaN(orderIdNum)) {
        throw new Error(`Invalid order_id: ${order_id}`);
      }
      
      console.log(`❌ Cancelling order ${orderIdNum}`);
      const update = await prisma.order.update({
        where: { order_id: orderIdNum },
        data: { status: "CANCELLED" },
      });
      console.log(`✅ Successfully cancelled order ${orderIdNum}`);
      return update;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }
};
export default paymentService;
