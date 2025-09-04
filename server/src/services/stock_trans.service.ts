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
      return await prisma.stock_transaction.findMany();
  }
};

export default stock_trans_service;
