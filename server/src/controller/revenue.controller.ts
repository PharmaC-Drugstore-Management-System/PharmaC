import revenueService from "../services/revenue.service";

const controller = {
    revenue : async (req : any, res : any) => {
        try {
            const result = await revenueService.get();
            return res.status(200).json({
                message: "Get revenue data successfully",
                data: result
            });
        } catch (error) {
            console.error("Controller error get revenue:", error);
            return res.status(500).json({
                message: "Internal server error",
                error: error
            });
        }
    },

    monthlyRevenue : async (req : any, res : any) => {
        try {
            const result = await revenueService.getMonthlyRevenue();
            return res.status(200).json({
                message: "Get monthly revenue data successfully",
                data: result
            });
        } catch (error) {
            console.error("Controller error get monthly revenue:", error);
            return res.status(500).json({
                message: "Internal server error",
                error: error
            });
        }
    },

    dailyRevenue : async (req : any, res : any) => {
        try {
            const result = await revenueService.getDailyRevenue();
            return res.status(200).json({
                message: "Get daily revenue data successfully",
                data: result
            });
        } catch (error) {
            console.error("Controller error get daily revenue:", error);
            return res.status(500).json({
                message: "Internal server error",
                error: error
            });
        }
    }
}

export default controller;
