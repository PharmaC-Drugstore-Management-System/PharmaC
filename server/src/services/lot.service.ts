import prisma from "../utils/prisma.utils";
const lot_service = {
  createLot: async (data: any) => {
    try {
      console.log('Received lot data:', data); // Debug log
      
      const newLot = await prisma.lot.create({
        data: {
          init_amount: data.init_amount,
          added_date: new Date(data.added_date),
          expired_date: new Date(data.expired_date),
          cost: data.cost,
          lot_no: data.lot_no,
          product_id: data.product_id,
        },
      });
      return newLot;
    } catch (error) {
      console.error('Error creating lot:', error); // Debug log
      throw new Error(`Error creating lot`);
    }
  },
  getAllLots: async () => {
      return await prisma.lot.findMany();
  },
  getLotById: async (id : any) => {
     const getLot = await prisma.lot.findUnique({
          where: { lot_id: parseInt(id) }
      });

      return getLot
  },
  getLotsByProductId: async (productId : any) => {
     const getLots = await prisma.lot.findMany({
          where: { product_id: parseInt(productId) },
          orderBy: { added_date: 'desc' }
      });

      return getLots
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
