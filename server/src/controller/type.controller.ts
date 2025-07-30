import { get } from "http";
import type_service from "../services/type.service";

const controller = {
    add: async (req: any, res: any) => {
        try {
            const { product_types_name } = req.body;
            if (!product_types_name) {
                return res.status(400).json({ message: "Product type name is required" });
            }
            const response = await type_service.create({ product_types_name });
            return res.status(200).json({ message: "Added product type successfully", data: response });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(500).json({ message: "Internal server error", error: errorMessage });
        }
    },
    get: async (req: any, res: any) => {
        try {
            const response = await type_service.fetch();
            if (response.length === 0) {
                return res.status(404).json({ message: "No product types found" });
            }
            return res.status(200).json({ message: "Fetched all product types", data: response });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(500).json({ message: "Internal server error", error: errorMessage });
        }
    }
}

export default controller;  