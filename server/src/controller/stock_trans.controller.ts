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
            console.log('📥 GET /stock/get-stock called');
            const stockTrans = await stock_trans_service.getAllStockTrans();
            console.log('📤 Sending response with', stockTrans.length, 'transactions');
            res.status(200).json(stockTrans);
        } catch (error) {
            console.error('❌ Error in get controller:', error);
            res.status(500).json({ error: "Error fetching stock transactions" });
        }
    },
    getById: async (req: any, res: any) => {
        try {
            const stockTrans = await stock_trans_service.getByIdStockTrans(parseInt(req.params.id));
            if (!stockTrans) {
                return res.status(404).json({ error: "Stock transaction not found" });
            }
            res.status(200).json(stockTrans);
        } catch (error) {
            res.status(500).json({ error: "Error fetching stock transaction" });
        }
    },
    

    // Get transactions by lot
    getByLotId: async (req: any, res: any) => {
        try {
            const lotId = parseInt(req.params.lotId);
            if (isNaN(lotId)) {
                return res.status(400).json({ error: 'Invalid lot ID' });
            }

            const transactions = await stock_trans_service.getTransactionsByLot(lotId);
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Error fetching transactions by lot:', error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    },

    // Get transactions by product ID (all lots in product)
    getByProductId: async (req: any, res: any) => {
        try {
            console.log('=== DEBUG CONTROLLER getByProductId ===');
            console.log('Request params:', req.params);
            console.log('Raw productId:', req.params.productId);
            
            const productId = parseInt(req.params.productId);
            console.log('Parsed productId:', productId);
            
            if (isNaN(productId)) {
                console.log('Invalid product ID detected');
                return res.status(400).json({ error: 'Invalid product ID' });
            }

            const transactions = await stock_trans_service.getTransactionsByProduct(productId);
            console.log('Transactions returned from service:', transactions.length);
            console.log('==========================================');
            
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Error fetching transactions by product:', error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    },

    // Get transactions with filters
    getWithFilters: async (req: any, res: any) => {
        try {
            const filters = {
                productId: req.query.productId ? parseInt(req.query.productId as string) : undefined,
                lotId: req.query.lotId ? parseInt(req.query.lotId as string) : undefined,
                transType: req.query.transType as string,
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
                refNo: req.query.refNo as string
            };

            const transactions = await stock_trans_service.getTransactionsWithFilters(filters);
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Error fetching filtered transactions:', error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    }
}
export default controller