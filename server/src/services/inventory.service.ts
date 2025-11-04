import prisma from "../utils/prisma.utils";
const inventory_service = {
  add_service: async (
    product_name: string,
    product_generic_name:string,
    brand: string,
    friendlyid: string,
    barcode: string,
    iscontrolled: boolean,
    product_type: string,
    unit: string,
    image?: string | null
  ) => {
    try {
      const add = await prisma.product.create({
        data: {
          product_name: product_name,
          generic_name:product_generic_name,
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
      const get = await prisma.product.findMany({
        include: {
          lot: {
            select: {
              lot_id: true,
              lot_no: true,
              init_amount: true,
              added_date: true,
              expired_date: true,
              cost: true,
              sell_price:true,
            }
          }
        }
      });
      return get;
    } catch (error: any) {
      console.error("Error in inventory_service.get_service():", error.message);
      throw error;
    }
  },
  getById_service: async (id: number) => {
    try {
      const product = await prisma.product.findUnique({
        where: { product_id : Number(id) },
      });

      return product;
    } catch (error: any) {
      console.error(
        "Error in inventory_service.getById_service():",
        error.message
      );
      throw error;
    }
  },
};

export default inventory_service;
