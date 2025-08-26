import signatureService from "../services/signature.service";
const controller = {
    addSignature : async (req: any, res: any) => {
        try {
            const newSignature = await signatureService.add(req.body);
            res.status(201).json(newSignature);
        } catch (error: any) {
            console.error("Error in controller.addSignature():", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

export default controller;