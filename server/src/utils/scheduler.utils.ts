import paymentService from "../services/payment.service";

/**
 * Check for expired orders and cancel them automatically
 * Runs periodically to check for orders that are still PENDING after 10 minutes
 */
export const checkExpiredOrdersJob = async () => {
  try {
    console.log("🕐 Running scheduled expired orders check...");
    const result = await paymentService.checkExpiredOrders();
    
    if (result.cancelled > 0) {
      console.log(`⚠️ Automatically cancelled ${result.cancelled} expired orders:`, result.cancelledOrderIds);
    } else {
      console.log("✅ No expired orders found");
    }
    
    return result;
  } catch (error) {
    console.error("❌ Error in scheduled expired orders check:", error);
  }
};

/**
 * Start the scheduler to check for expired orders every minute
 */
export const startScheduler = () => {
  console.log("🚀 Starting expired orders scheduler...");
  
  // Run immediately on startup
  checkExpiredOrdersJob();
  
  // Then run every 1 minute (60000 ms)
  setInterval(checkExpiredOrdersJob, 60000);
  
  console.log("✅ Scheduler started - checking expired orders every 1 minute");
};
