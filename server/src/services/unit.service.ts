import prisma from "../utils/prisma.utils";
const unit_service = {
  create: async (data: any) => {
    try {
      const unit = await prisma.unit.create({
        data: {
          unit_name: data.unit_name,
        },
      });
      return unit;
    } catch (error: any) {
      console.error("Error in unit_service.create_unit():", error.message);
      throw error;
    }
  },
  fetch: async () =>{
    try { 
        const units = await prisma.unit.findMany();
        if (units.length === 0){
            throw new Error("No unit found")
        }
        return units;
    }
    catch(error: any){
        console.error("Error in unit_service.get():", error.message);
        throw error;
    }
  }
};

export default unit_service;