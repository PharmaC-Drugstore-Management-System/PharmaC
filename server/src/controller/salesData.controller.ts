import salesDataService from '../services/salesData.service.ts' 
const controller = {
    getSalesVolume: async (req: any, res: any) => {
        try {
            const result = await salesDataService.getSalesData();
            res.status(200).json({status:true, data: result});
        } catch (error : string | any) {
            console.error('Error fetching sales volume data:', error);
            res.status(500).json({ error: 'Internal server error in sales volumes controller', message: error.message });
        }
    }   

}
export default controller;