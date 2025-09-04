import prisma from "../utils/prisma.utils";

const stock_trans_service = {
  createStockTrans: async (data: any) => {
    try {
      const newStockTrans = await prisma.stock_transaction.create({
        data: {
          trans_type: data.trans_type,
          trans_date: data.trans_date,
          qty: data.qty,
          ref_no: data.ref_no,
          note: data.note,
          lot_id_fk: data.lot_id_fk,
        },
      });
      return newStockTrans;
    } catch (error) {
      throw new Error("Error creating stock transaction");
    }
  },
  getAllStockTrans: async () => {
    try {
      return await prisma.stock_transaction.findMany({
        include: {
          lot: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          trans_date: "desc",
        },
      });
    } catch (error) {
      throw new Error("Error fetching stock transactions");
    }
  },

  getByIdStockTrans: async (id: number) => {
    try {
      const stockTransaction = await prisma.stock_transaction.findUnique({
        where: { stock_trans_id: id },
        include: {
          lot: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!stockTransaction) {
        throw new Error("Stock transaction not found");
      }

      return stockTransaction;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error fetching stock transaction");
    }
  },

  // Get transactions by specific lot
  getTransactionsByLot: async (lotId: number) => {
    try {
      return await prisma.stock_transaction.findMany({
        where: {
          lot_id_fk: lotId,
        },
        include: {
          lot: true,
        },
        orderBy: {
          trans_date: "desc",
        },
      });
    } catch (error) {
      throw new Error("Error fetching transactions by lot");
    }
  },

  // Get transactions with filters
  getTransactionsWithFilters: async (filters: {
    productId?: number;
    lotId?: number;
    transType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    refNo?: string;
  }) => {
    try {
      const where: any = {};

      if (filters.productId) {
        where.lot = { product_id: filters.productId };
      }

      if (filters.lotId) {
        where.lot_id_fk = filters.lotId;
      }

      if (filters.transType) {
        where.trans_type = filters.transType;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.trans_date = {};
        if (filters.dateFrom) where.trans_date.gte = filters.dateFrom;
        if (filters.dateTo) where.trans_date.lte = filters.dateTo;
      }

      if (filters.refNo) {
        where.ref_no = {
          contains: filters.refNo,
          mode: "insensitive",
        };
      }

      return await prisma.stock_transaction.findMany({
        where,
        include: {
          lot: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          trans_date: "desc",
        },
      });
    } catch (error) {
      throw new Error("Error fetching filtered transactions");
    }
  },
};

export default stock_trans_service;
