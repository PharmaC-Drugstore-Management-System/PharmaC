import { get } from "http";
import lot_service from "../services/lot.service";

const controller = {
  add: async (req: any, res: any) => {
    try {
      console.log("Add lot request body:", req.body); // Debug log
      const newLot = await lot_service.createLot(req.body);
      if (!newLot)
        return res
          .status(404)
          .json({
            status: false,
            error: "404 not found body in lot controller",
          });
      res.status(201).json({ status: true, data: newLot });
    } catch (error) {
      console.error("Lot controller error:", error); // Debug log
      res.status(500).json({
        status: false,
        error: "Error creating lot",
      });
    }
  },
  get: async (req: any, res: any) => {
    try {
      const lots = await lot_service.getAllLots();
      res.status(200).json(lots);
    } catch (error) {
      res.status(500).json({ error: "Error fetching lot" });
    }
  },
  getById: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const lot = await lot_service.getLotById(id);
      if (!lot) {
        return res.status(404).json({ status: false, error: "Lot not found" });
      }
      res.status(200).json({ status: true, data: lot });
    } catch (error) {
      console.error("Get lot by ID error:", error);
      res.status(500).json({
        status: false,
        error: (error as Error).message || "Error fetching lot",
      });
    }
  },
  getByProductId: async (req: any, res: any) => {
    try {
      const { productId } = req.params;
      const lots = await lot_service.getLotsByProductId(productId);
      res.status(200).json({ status: true, data: lots });
    } catch (error) {
      console.error("Get lots by product ID error:", error);
      res.status(500).json({
        status: false,
        error: (error as Error).message || "Error fetching lots for product",
      });
    }
  },
  update: async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const updatedLot = await lot_service.updateLot(parseInt(id), req.body);
      if (!updatedLot) {
        return res.status(404).json({ status: false, error: "Lot not found" });
      }
      res.status(200).json({ status: true, data: updatedLot });
    } catch (error) {
      console.error("Update lot error:", error);
      res.status(500).json({
        status: false,
        error: (error as Error).message || "Error updating lot",
      });
    }
  },
};

export default controller;
