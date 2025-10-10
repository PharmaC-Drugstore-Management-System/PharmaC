import productTypeService from "../services/producttype.service.ts";    
const controller = {
    getProductTypes: async (req : any, res : any) => {
        try {
            const result = await productTypeService.getProductTypes();
            return res.status(200).json({ status:true, data: result });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error at get product type", error: error });  
        }
    },
}
export default controller;