import { get } from "http";
import member_service from "../services/membership.service";
const controller = {
    add: async (req:any, res:any) => {
        try {
            const newMember = await member_service.add_service(req.body);
            res.status(201).json(newMember);
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: "An unknown error occurred." });
            }
        }
    },
    get: async (req: any , res: any) => {
        try { 
            const members = await member_service.get_service();
            res.status(200).json(members);
        }
        catch(error) {
            if (error instanceof Error) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: "An unknown error occurred." });
            }
        }
    }
}
export default controller;