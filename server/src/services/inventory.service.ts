import prisma from "../utils/prisma.utils";
const inventory_service = {
  add_service: async (
    product_name: string,
    brand: string,
    friendlyid: string,
    barcode: string,
    iscontrolled: boolean,
    product_type: string,
    unit: string,
    image?: string | null,
  ) => {
    try {
      const add = await prisma.product.create({
        data: {
          product_name: product_name,
          brand: brand,
          friendlyid: friendlyid,
          barcode: barcode,
          iscontrolled: iscontrolled,
          producttype: product_type,
          unit: unit,
          image: image,
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
      const get = await prisma.product.findMany();
      return get;
    } catch (error: any) {
      console.error("Error in inventory_service.get_service():", error.message);
      throw error;
    }
  },
};

export default inventory_service;
