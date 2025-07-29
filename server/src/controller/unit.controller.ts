import unit_service from "../services/unit.service";
const controller = {
  add: async (req: any, res: any) => {
    try {
      const { unit_name } = req.body;
      const response = await unit_service.create({
        unit_name: unit_name,
      });

      return res
        .status(200)
        .json({ message: "Added unit successfully", data: response });
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
        const response = await unit_service.fetch();
        if (response.length === 0) {
            return res.status(404).json({ message: "No unit found" });
        }
        return res.status(200).json({ message: "Get all units", data: response });
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
