import prisma from "../utils/prisma.utils";
const lot_service = {
  createLot: async (data: any) => {
    try {
      console.log('=== Creating lot in service ===');
      console.log('Received lot data:', data);
      console.log('sell_price value:', data.sell_price);
      console.log('sell_price type:', typeof data.sell_price);
      
      const newLot = await prisma.lot.create({
        data: {
          init_amount: data.init_amount,
          added_date: new Date(data.added_date),
          expired_date: new Date(data.expired_date),
          cost: parseFloat(data.cost),
          sell_price: parseFloat(data.sell_price), // Ensure it's a proper float
          lot_no: data.lot_no,
          product_id: data.product_id,
        },
      });
      
      console.log('Created lot:', newLot);
      console.log('Created lot sell_price:', newLot.sell_price);
      console.log('==============================');
      
      return newLot;
    } catch (error) {
      console.error('Error creating lot:', error); // Debug log
      throw new Error(`Error creating lot`);
    }
  },
  getAllLots: async () => {
      return await prisma.lot.findMany({
        where: { deleted_at: null }
      });
  },
  getLotById: async (id : any) => {
     const getLot = await prisma.lot.findUnique({
          where: { 
            lot_id: parseInt(id),
            deleted_at: null
          }
      });

      return getLot
  },
  getLotsByProductId: async (productId : any) => {
     const getLots = await prisma.lot.findMany({
          where: { 
            product_id: parseInt(productId),
            deleted_at: null
          },
          orderBy: { added_date: 'desc' }
      });

      return getLots
  },
  getLotWithProduct : async() => {
    try {
      const get = await prisma.lot.findMany({
        where: { deleted_at: null },
        include: {
          product: true
        }
      });
      return get;
    } catch (error) {
       console.error('Error to get lot with product:', error); // Debug log
      throw new Error(`Error to get lot with product`);
    }
  },
  updateLot: async (id: number, data: any) => {
      return await prisma.lot.update({
          where: { lot_id: id },
          data
      });
  },
  deleteLot: async (id: number) => {
    // Soft delete - just set deleted_at timestamp
    const lot = await prisma.lot.findUnique({
      where: { lot_id: id }
    });
    
    if (!lot) {
      throw new Error('Lot not found');
    }

    if (lot.deleted_at) {
      throw new Error('Lot has already been deleted');
    }

    // Update the lot with deleted_at timestamp
    const deletedLot = await prisma.lot.update({
      where: { lot_id: id },
      data: {
        deleted_at: new Date()
      }
    });
    
    return deletedLot;
  }
};
export default lot_service;
