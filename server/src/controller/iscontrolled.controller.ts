import { get } from "http";
import iscontrolled_service from "../services/iscontrolled.service";
const controller = {
  add: async (req: any, res: any) => {
    try {
      const { is_controlled } = req.body;
      if (!is_controlled) {
        return res.status(404).json({ message: "404 Not found data" });
      }
      const response = await iscontrolled_service.create({ is_controlled });
      return res
        .status(200)
        .json({ message: "Added controlled medicine", data: response });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
  get: async (req: any, res: any) => {
    try {
      const response = await iscontrolled_service.fetch();
      return res
        .status(200)
        .json({ message: "Fetched controlled medicines", data: response });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },
};
export default controller;
