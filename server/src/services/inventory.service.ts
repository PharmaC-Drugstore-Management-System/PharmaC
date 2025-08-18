import prisma from "../utils/prisma.utils";
const inventory_service = {
  add_service: async (
    product_name: string,
    brand: string,
    price: number,
    exDate: Date,
    product_type_id: number,
    unit_id: number,
    iscontrolled_id: number,
    amount: number
  ) => {
    try {
      const add = await prisma.product.create({
        data: {
          product_name: product_name,
          brand: brand,
        },
      });
      return add;
    } catch (error: any) {
      console.error("Error in inventory_service.regis():", error.message);
      throw error;
    }
  },

  get_service: async () => {
    try {
      const get = await prisma.product.findMany({});
      return get;
    } catch (error: any) {
      console.error("Error in inventory_service.get_service():", error.message);
      throw error;
    }
  },
};

export default inventory_service;
