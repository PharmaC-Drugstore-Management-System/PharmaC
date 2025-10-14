import { get } from "http";
import prisma from "../utils/prisma.utils.ts"

const dashboardService = {
    // Get total sales by summing all total_amount in order table
    getTotalSales: async () => {
        try {
            const result = await prisma.order.aggregate({
                _sum: {
                    total_amount: true, // Sum all total_amount column values
                },
                where: {
                    status: {
                        not: 'CANCELLED' // Exclude cancelled orders
                    }
                }
            });

            return result._sum.total_amount || 0;
        } catch (error) {
            console.error("Error calculating total sales:", error);
            throw new Error("Failed to calculate total sales");
        }
    },

    // Get total sales with additional filters (optional date range)
    getTotalSalesWithFilters: async (startDate?: Date, endDate?: Date) => {
        try {
            const whereClause: any = {
                status: {
                    not: 'CANCELLED'
                }
            };

            // Add date filter if provided
            if (startDate || endDate) {
                whereClause.date = {};
                if (startDate) whereClause.date.gte = startDate;
                if (endDate) whereClause.date.lte = endDate;
            }

            const result = await prisma.order.aggregate({
                _sum: {
                    total_amount: true,
                    total_price: true, // Also get total_price sum for comparison
                },
                _count: {
                    order_id: true // Count total orders
                },
                where: whereClause
            });

            return {
                totalAmount: result._sum.total_amount || 0,
                totalPrice: result._sum.total_price || 0,
                totalOrders: result._count.order_id || 0
            };
        } catch (error) {
            console.error("Error calculating filtered total sales:", error);
            throw new Error("Failed to calculate filtered total sales");
        }
    },

    // Get sales summary with breakdown
    getSalesSummary: async () => {
        try {
            // Get overall totals
            const totalSales = await prisma.order.aggregate({
                _sum: {
                    total_amount: true,
                    total_price: true,
                },
                _count: {
                    order_id: true
                },
                where: {
                    status: {
                        not: 'CANCELLED'
                    }
                }
            });

            // Get today's sales
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todaySales = await prisma.order.aggregate({
                _sum: {
                    total_amount: true,
                },
                _count: {
                    order_id: true
                },
                where: {
                    status: {
                        not: 'CANCELLED'
                    },
                    date: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            });

            return {
                totalSales: totalSales._sum.total_amount || 0,
                totalPrice: totalSales._sum.total_price || 0,
                totalOrders: totalSales._count.order_id || 0,
                todaySales: todaySales._sum.total_amount || 0,
                todayOrders: todaySales._count.order_id || 0
            };
        } catch (error) {
            console.error("Error getting sales summary:", error);
            throw new Error("Failed to get sales summary");
        }
    },
    getTotalOrder : async () => {
        try {
            const count = await prisma.order.count();
            return count;
        } catch (error) {
            console.error("Error getting order count:", error);
            throw new Error("Failed to get order count");
        }        
    },
    getTotalProduct : async () => {
        try {
            const count = await prisma.product.count();
            return count;
        } catch (error) {
            console.error("Error getting product count:", error);
            throw new Error("Failed to get product count");
        }
    },
    getTotalMember : async () => {
        try {
            const count = await prisma.customer.count();
            return count;
        } catch (error) {
            console.error("Error getting member count:", error);
            throw new Error("Failed to get member count");
        }
    },

    // Get inventory grouped by product type
    getInventoryByProductType: async () => {
        try {
            // Get current stock from lot table with initial amounts
            const inventory = await prisma.lot.groupBy({
                by: ['product_id'],
                _sum: {
                    init_amount: true
                },
                where: {
                    init_amount: {
                        gt: 0
                    }
                },
                _max: {
                    product_id: true
                }
            });

            // Get product types for each product
            const productIds = inventory.map(item => item.product_id).filter(Boolean) as number[];
            const products = await prisma.product.findMany({
                where: {
                    product_id: {
                        in: productIds
                    }
                },
                select: {
                    product_id: true,
                    producttype: true
                }
            });

            // Group by product type
            const stockByType: { [key: string]: number } = {};
            inventory.forEach(item => {
                const product = products.find(p => p.product_id === item.product_id);
                if (product && product.producttype) {
                    if (!stockByType[product.producttype]) {
                        stockByType[product.producttype] = 0;
                    }
                    stockByType[product.producttype] += item._sum.init_amount || 0;
                }
            });

            return Object.entries(stockByType).map(([productType, totalStock]) => ({
                productType,
                totalStock
            }));
        } catch (error) {
            console.error('Error fetching inventory by product type:', error);
            throw new Error('Failed to fetch inventory data');
        }
    },

    // Simple restock recommendations
    getRestockRecommendations: async () => {
        try {
            // Get current inventory by product type
            const inventory = await dashboardService.getInventoryByProductType();
            
            // Get sales data for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const salesData = await prisma.order_item.groupBy({
                by: ['product_id'],
                _sum: {
                    quantity: true
                },
                where: {
                    order: {
                        date: {
                            gte: thirtyDaysAgo
                        },
                        status: {
                            not: 'CANCELLED'
                        }
                    }
                }
            });

            // Get product details
            const products = await prisma.product.findMany({
                select: {
                    product_id: true,
                    producttype: true
                }
            });

            // Calculate sales by product type
            const salesByType: { [key: string]: number } = {};
            salesData.forEach((sale: any) => {
                const product = products.find(p => p.product_id === sale.product_id);
                if (product && product.producttype) {
                    if (!salesByType[product.producttype]) {
                        salesByType[product.producttype] = 0;
                    }
                    salesByType[product.producttype] += sale._sum.quantity || 0;
                }
            });

            // Generate simple recommendations
            const recommendations = inventory.map((inv, index) => {
                const totalSold = salesByType[inv.productType] || 0;
                const dailyAverage = totalSold / 30;
                const weeklyAverage = dailyAverage * 7;
                
                // Simple restock logic: if current stock is less than 2 weeks of average sales
                const twoWeeksSupply = weeklyAverage * 2;
                const restockNeeded = Math.max(0, Math.ceil(twoWeeksSupply - inv.totalStock));
                
                // Simple priority based on stock levels
                let priority = 'low';
                let color = 'text-green-600 bg-green-50 border-green-200';
                
                if (inv.totalStock < weeklyAverage) {
                    priority = 'critical';
                    color = 'text-red-700 bg-red-100 border-red-300';
                } else if (inv.totalStock < twoWeeksSupply) {
                    priority = 'high';
                    color = 'text-red-600 bg-red-50 border-red-200';
                } else if (inv.totalStock < weeklyAverage * 3) {
                    priority = 'medium';
                    color = 'text-yellow-600 bg-yellow-50 border-yellow-200';
                }

                return {
                    group: String.fromCharCode(65 + index),
                    name: inv.productType,
                    available: inv.totalStock,
                    expected: Math.ceil(twoWeeksSupply * 1.5), // Target stock level
                    restock: restockNeeded,
                    priority,
                    color
                };
            });

            // Sort by priority
            const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
            recommendations.sort((a, b) => 
                priorityOrder[a.priority as keyof typeof priorityOrder] - 
                priorityOrder[b.priority as keyof typeof priorityOrder]
            );
            
            return recommendations;
        } catch (error) {
            console.error('Error calculating restock recommendations:', error);
            throw new Error('Failed to calculate restock recommendations');
        }
    }
}

export default dashboardService;