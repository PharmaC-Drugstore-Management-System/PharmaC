import groupSalesHistoryService from "../services/group-sales-history.service";

const controller = {
  listByProductType: async (req: any, res: any) => {
    try {
      const { producttype } = req.params;
      const { startDate, endDate } = req.query as {
        startDate?: string;
        endDate?: string;
      };

      if (startDate && isNaN(Date.parse(startDate))) {
        return res.status(400).json({ status: false, message: "Invalid startDate (YYYY-MM-DD)" });
      }
      if (endDate && isNaN(Date.parse(endDate))) {
        return res.status(400).json({ status: false, message: "Invalid endDate (YYYY-MM-DD)" });
      }

      const data = await groupSalesHistoryService.getByProductType({
        producttype,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      res.status(200).json(data);
    } catch (error) {
      console.error("group-sales-history controller error:", error);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  },
};

export default controller;
