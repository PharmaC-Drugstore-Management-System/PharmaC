import prisma from "../utils/prisma.utils";
const lot_service = {
  createLot: async (data: any) => {
    try {
      const newLot = await prisma.lot.create({
        data: {
          init_amount: data.init_amount,
          added_date: data.added_date,
          expired_date: data.expired_date,
          cost: data.cost,
          lot_no: data.lot_no,
          product_id: data.product_id,
        },
      });
      return newLot;
    } catch (error) {
      throw new Error("Error creating lot");
    }
  },
  getAllLots: async () => {
      return await prisma.lot.findMany();
  },
  getLotById: async (id : any) => {
      return await prisma.lot.findUnique({
          where: { lot_id: id }
      });
  },
  // updateLot: async (id, data) => {
  //     return await prisma.lot.update({
  //         where: { lot_id: id },
  //         data
  //     });
  // },
  // deleteLot: async (id) => {
  //     return await prisma.lot.delete({
  //         where: { lot_id: id }
  //     });
  // }
};
export default lot_service;
