import prisma from "../utils/prisma.utils";
const type_service = {
    create: async (data: any) =>{
        try { 
            const type = await prisma.product_types.create({
                data:{ 
                    product_types_name : data.product_types_name,
                }
            })
            return type;
        }
        catch(error: any){
            console.error("Error in type_service.create():", error.message);
            throw error;
        }
    },
    fetch: async () =>{
        try {
            const types = await prisma.product_types.findMany();
            if (types.length === 0) {
                throw new Error("No product types found");
            }
            return types;
        } catch (error: any) {
            console.error("Error in type_service.fetch():", error.message);
            throw error;
        }
    }
};

export default type_service
