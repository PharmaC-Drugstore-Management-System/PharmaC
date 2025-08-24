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
      return retrieveIntent.status;
    } catch (error) {}
  },
  updateStatus: async(order_id: number) => {
    try {
      const update = await prisma.order.update({
        where: { order_id: order_id },
        data: { status: "PAID" },
      });
      return update;
    } catch (error) {
      
    }
  }
};
export default paymentService;
