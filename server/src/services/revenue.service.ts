import prisma from "../utils/prisma.utils";

const revenueService = {
    get : async () => {
       try {
            const data = await prisma.order.findMany({
                include: {
                    customer: {
                        select: {
                            customer_id: true,
                            name: true,
                            phone_number: true,
                            citizen_id: true
                        }
                    }
                },
                orderBy: {
                    order_id: 'desc'
                }
            })
            return data;
        } catch (error) {
             console.error("Service error get list order:", error);
            throw error;
        }
    },

    getMonthlyRevenue : async () => {
        try {
            // Get all orders with their total amounts and dates (PAID orders only)
            const orders = await prisma.order.findMany({
                where: {
                    status: 'PAID'
                },
                select: {
                    total_amount: true,
                    date: true,
                    status: true
                },
                orderBy: {
                    date: 'asc'
                }
            });

            // Group orders by month and sum revenue
            const monthlyRevenue: { [key: string]: number } = {};
            
            orders.forEach(order => {
                // Check if order has a valid date
                if (order.date) {
                    // Format date to YYYY-MM format for grouping
                    const monthKey = order.date.toISOString().slice(0, 7); // "2024-08"
                    
                    if (!monthlyRevenue[monthKey]) {
                        monthlyRevenue[monthKey] = 0;
                    }
                    
                    monthlyRevenue[monthKey] += Number(order.total_amount || 0);
                }
            });

            // Convert to the expected format with last day of month
            const result = Object.entries(monthlyRevenue).map(([month, revenue]) => {
                const [year, monthNum] = month.split('-');
                const lastDayOfMonth = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
                const date = `${year}-${monthNum}-${lastDayOfMonth.toString().padStart(2, '0')}`;
                
                return {
                    date: date,
                    revenue: Math.round(revenue * 100) / 100 // Round to 2 decimal places
                };
            });

            return result;
        } catch (error) {
            console.error("Service error get monthly revenue:", error);
            throw error;
        }
    },

    getDailyRevenue : async () => {
        try {
            // Get all orders with their total amounts and dates (PAID orders only)
            const orders = await prisma.order.findMany({
                where: {
                    status: 'PAID'
                },
                select: {
                    total_amount: true,
                    date: true,
                    status: true
                },
                orderBy: {
                    date: 'asc'
                }
            });

            // Group orders by day and sum revenue
            const dailyRevenue: { [key: string]: number } = {};
            
            orders.forEach(order => {
                // Check if order has a valid date
                if (order.date) {
                    // Format date to YYYY-MM-DD format for grouping
                    const dayKey = order.date.toISOString().slice(0, 10); // "2024-08-26"
                    
                    if (!dailyRevenue[dayKey]) {
                        dailyRevenue[dayKey] = 0;
                    }
                    
                    dailyRevenue[dayKey] += Number(order.total_amount || 0);
                }
            });

            // Convert to the expected format
            const result = Object.entries(dailyRevenue).map(([date, revenue]) => {
                return {
                    date: date,
                    revenue: Math.round(revenue * 100) / 100 // Round to 2 decimal places
                };
            });

            return result;
        } catch (error) {
            console.error("Service error get daily revenue:", error);
            throw error;
        }
    }
}
export default revenueService