import { get } from "http";
import stock_trans_service from "../services/stock_trans.service";

const controller = {
    add: async (req: any, res: any) => {
        try {
            const newStockTrans = await stock_trans_service.createStockTrans(req.body);
            res.status(201).json(newStockTrans);
        } catch (error) {
            res.status(500).json({ error : "Error creating stock transaction" });
        }
    },
    get: async (req: any, res: any) => {
        try {
            const stockTrans = await stock_trans_service.getAllStockTrans();
            res.status(200).json(stockTrans);
        } catch (error) {
            res.status(500).json({ error: "Error fetching stock transactions" });
        }
    }
}
export default controller