import inventory_service from "../services/inventory.service.ts";
import path from "path";

const controller = {
  add: async (req: any, res: any) => {
    try {
      const {
        product_name,
        brand,
        friendlyid,
        barcode,
        iscontrolled,
        producttype,
        unit,
      } = req.body;
      console.log("Incoming request body:", req.body);

      const iscontrolledBool = iscontrolled === "true" || iscontrolled === true;

      const file = req.file;
      const image = file ? `/uploads/${file.filename}` : null;

      const response = await inventory_service.add_service(
        product_name,
        brand,
        friendlyid,
        barcode,
        iscontrolledBool,
        producttype,
        unit,
        image
      );
      console.log("Uploaded file:", response);
      return res
        .status(200)
        .json({ message: "Added medicine into inventroy", data: response });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: errorMessage });
    }
  },
  get: async (req: any, res: any) => {
    try {
      const response = await inventory_service.get_service();
      if (response.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }
      return res
        .status(200)
        .json({ message: "Get all Product", data: response });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: errorMessage });
    }
  },
  getId: async (req: any, res: any) => {
    try {
      const id = req.params.id;
      console.log(id)
      const response = await inventory_service.getById_service(id);
      return res.status(200).json({status:true, data:response})
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: errorMessage });
    }
  },
};
export default controller;
