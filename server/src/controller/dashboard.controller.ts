import dashboardService from "../services/dashboard.service";

const controller = {
    // Get total sales (sum of all total_amount)
    getTotalSales: async (req: any, res: any) => {
        try {
            const totalSales = await dashboardService.getTotalSales();
            
            return res.status(200).json({
                status: true,
                message: "Total sales retrieved successfully",
                data: {
                    totalSales: totalSales
                }
            });
        } catch (error: any) {
            console.error("Error in getTotalSales controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get Total Sales',
                error: error.message
            });
        }
    },

    // Get total sales with date filters
    getTotalSalesWithFilters: async (req: any, res: any) => {
        try {
            const { startDate, endDate } = req.query;
            
            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;
            
            const salesData = await dashboardService.getTotalSalesWithFilters(start, end);
            
            return res.status(200).json({
                status: true,
                message: "Filtered sales data retrieved successfully",
                data: salesData
            });
        } catch (error: any) {
            console.error("Error in getTotalSalesWithFilters controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get filtered sales',
                error: error.message
            });
        }
    },

    // Get comprehensive sales summary
    getSalesSummary: async (req: any, res: any) => {
        try {
            const summary = await dashboardService.getSalesSummary();
            
            return res.status(200).json({
                status: true,
                message: "Sales summary retrieved successfully",
                data: summary
            });
        } catch (error: any) {
            console.error("Error in getSalesSummary controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get sales summary',
                error: error.message
            });
        }
    },
    getTotalOrder : async (req: any, res: any) => {
        try {
            const count = await dashboardService.getTotalOrder();
            return res.status(200).json({
                status: true,
                message: "Total order retrieved successfully",
                data: {
                    totalOrder: count
                }
            });
        } catch (error : any) {
            console.error("Error in getTotalOrder controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get Total Order',
                error: error.message
            });
        }
    },
    getTotalProduct : async (req: any, res: any) => {
        try {
            const count = await dashboardService.getTotalProduct();
            return res.status(200).json({
                status: true,
                message: "Total product retrieved successfully",
                data: {
                    totalProduct: count
                }
            });
        } catch (error : any) {
            console.error("Error in getTotalProduct controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get Total Product',
                error: error.message
            });
        }
    },
    getTotalMember : async (req: any, res: any) => {
        try {   
            const count = await dashboardService.getTotalMember();
            return res.status(200).json({
                status: true,
                message: "Total member retrieved successfully",
                data: {
                    totalMember: count
                }
            });
        } catch (error : any) {
            console.error("Error in getTotalMember controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get Total Member',
                error: error.message
            });
        }
    },

    // Get inventory by product type
    getInventoryByProductType: async (req: any, res: any) => {
        try {
            const inventory = await dashboardService.getInventoryByProductType();
            
            return res.status(200).json({
                status: true,
                message: "Inventory by product type retrieved successfully",
                data: inventory
            });
        } catch (error: any) {
            console.error("Error in getInventoryByProductType controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get inventory by product type',
                error: error.message
            });
        }
    },

    // Get restock recommendations
    getRestockRecommendations: async (req: any, res: any) => {
        try {
            const recommendations = await dashboardService.getRestockRecommendations();
            
            return res.status(200).json({
                status: true,
                message: "Restock recommendations retrieved successfully",
                data: recommendations
            });
        } catch (error: any) {
            console.error("Error in getRestockRecommendations controller:", error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error in get restock recommendations',
                error: error.message
            });
        }
    }

}

export default controller;