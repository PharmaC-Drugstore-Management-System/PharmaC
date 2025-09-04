import { get } from "http";
import lot_service from "../services/lot.service";

const controller = {
    add: async (req:any, res:any) => {
        try {
            const newLot = await lot_service.createLot(req.body);
            res.status(201).json(newLot);
        } catch (error) {
            res.status(500).json({ error: "Error creating lot" });
        }
    },
    get: async (req:any, res:any) => {
        try {
            const lots = await lot_service.getAllLots();
            res.status(200).json(lots);
        } catch (error) {
            res.status(500).json({ error: "Error fetching lot" });
        }
    }
}

export default controller;