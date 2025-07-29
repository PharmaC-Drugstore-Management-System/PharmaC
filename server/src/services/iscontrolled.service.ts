import prisma from "../utils/prisma.utils";
const iscontrolled_service = {
  create: async (data: any) => {
    try {
      const iscontrolled = await prisma.is_controlled_medicine.create({
        data: {
          is_controlled: data.is_controlled,
        },
      });
      return iscontrolled;
    } catch (error: any) {
      console.error("Error in unit_service.create_unit():", error.message);
      throw error;
    }
  },
  fetch: async () => {
    try { 
      const iscontrolled = await prisma.is_controlled_medicine.findMany();
      if (iscontrolled.length === 0) {
        throw new Error("No controlled medicine found");
      }
      return iscontrolled;
    }
    catch (error: any) {
      console.error("Error in iscontrolled_service.fetch():", error.message);
      throw error;
    }
  }
};

export default iscontrolled_service;