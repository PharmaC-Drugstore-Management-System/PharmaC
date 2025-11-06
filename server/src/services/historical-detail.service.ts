import prisma from "../utils/prisma.utils";
const service =  {
    getHistoricalDetail: async (producttype: string, startDate?: Date, endDate?: Date) => {
        try {
            // Build date filter
            const dateFilter: any = {};
            if (startDate || endDate) {
                dateFilter.date = {};
                if (startDate) {
                    dateFilter.date.gte = startDate;
                }
                if (endDate) {
                    // Set endDate to end of day (23:59:59)
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    dateFilter.date.lte = endOfDay;
                }
            }
            
            // Fetch all PAID orders that contain the specific product type
            // Same format as order.list() but filtered by product type and date range
            const data = await prisma.order.findMany({
                where: {
                    status: 'PAID', // Only include PAID orders
                    order_items: {
                        some: {
                            product: {
                                producttype: producttype
                            }
                        }
                    },
                    ...dateFilter
                },
                include: {
                    customer: {
                        select: {
                            customer_id: true,
                            name: true,
                            phone_number: true,
                            citizen_id: true,
                        },
                    },
                },
                orderBy: {
                    total_amount: "desc", // Sort by total_amount high to low
                },
            });
            return data;
        } catch (error) {
            console.error('Error fetching historical data:', error);
            throw new Error('Error fetching historical data');
        }
    }
}

export default service;