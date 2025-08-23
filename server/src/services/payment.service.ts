import Stripe from "stripe";
const stripe = new Stripe(
  "sk_test_51RzJdJCxeJXS3A6fHM2HR8ZiMdhdhz2BVVp4YPd0bFJewsPvPZSrUCMdzkV8k7uYtZ9OH9THa5FHTHa3ep7syTms003X1MWn9v"
);
const paymentService = {
  intents: async (amount: any, currency: any, payment_type: any) => {
    try {
      // Create a Payment Intent using the Stripe API
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        payment_method_types: [payment_type],
      });

      // Send the payment intent object back in the response
      return paymentIntent;
    } catch (error) {
      // Handle errors from the Stripe API or network issues
      throw error;
    }
  },
  medtod: async (customer : any, type : any, email : any) =>{
    try {
        const paymentMethod  = await stripe.paymentMethods.create({
            type: type,
            billing_details: {
            email: email,
            name:customer
            }
        });
        return paymentMethod;
    } catch (error) {
        throw error;
    }
  },
  
};
export default paymentService;
