import { get } from "http";
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
    amount:number
  ) => {
    try {
      const add = await prisma.product.create({
        data: {
          product_name: product_name,
          brand: brand,
          price: price,
          product_type_id: product_type_id,
          unit_id: unit_id,
          iscontrolled_id: iscontrolled_id,
          expiredDate: exDate,
          amount: amount
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
        include:{
          product_types: true,
          unit: true,
          is_controlled_medicine: true
        }
      });  
      return get;
    } catch (error: any) {
      console.error("Error in inventory_service.get_service():", error.message);
      throw error;
    }
  },
};

export default inventory_service;
