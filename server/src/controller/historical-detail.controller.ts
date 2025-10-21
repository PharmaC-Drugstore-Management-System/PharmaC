import historicalDetailService from "../services/historical-detail.service.ts";  
const controller = {
    getHistoricalDetail: async (req : any, res : any) => {
        try {
            const { producttype } = req.params;
            const { startDate, endDate } = req.query;
            
            // Validate date parameters
            if (startDate && isNaN(Date.parse(startDate))) {
                return res.status(400).json({ message: 'Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD)' });
            }
            
            if (endDate && isNaN(Date.parse(endDate))) {
                return res.status(400).json({ message: 'Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD)' });
            }
            
            const historicalData = await historicalDetailService.getHistoricalDetail(
                producttype, 
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined
            );
            
            res.status(200).json(historicalData);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error In Get Historical Detail', error });
        }
    }

}
export default controller;