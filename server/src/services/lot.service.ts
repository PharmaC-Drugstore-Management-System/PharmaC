import prisma from "../utils/prisma.utils";

const lot_service = {
  create: async (data: any) => {
    try {
        const lot = await prisma.lot.create({
          data: {
            name: data.name,
            amount: data.amount,
            added_date: new Date(data.added_date),
            expired_date: new Date(data.expired_date),
            cost: data.cost,
          },
        });
        return lot;
    } catch (error: any) {
      console.error("Error in lot_service", error.message);
      throw error;
    }
  },
  get : async () =>{
    try {
      const lot = await prisma.lot.findMany({
        include:{
          product : true,
           stock_lot_stock_idTostock: true,
        }
      })
      return lot
    } catch (error: any) {
      console.error("Error in lot_service", error.message);
      throw error;
    }
  }

};

export default lot_service;
