import prisma from "../utils/prisma.utils";
const inventory_service = {
  add_service: async (
    product_name: string,
    brand: string,
    price: number,
    exDate: Date
  ) => {
    try {
      const add = await prisma.product.create({
        data: {
          product_name: product_name,
          brand: brand,
          price: price,
          expiredDate: exDate,
        },
      });
      return add
    } catch (error : any) {
      console.error("Error in inventory_service.regis():", error.message);
      throw error;
    }
  },
};
export default inventory_service;
