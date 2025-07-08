import role_service from "../services/role.service";
const controller = {
  editrole: async (req: any, res: any) => {
    try {
      const { employee_id, role_id_fk } = req.body;

      const response = await role_service.editrole_service(
        employee_id,
        role_id_fk
      );

      return res
        .status(200)
        .json({ message: "Role edited successfully", data: response });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error to edit role", error: error.message });
    }
  },
  role: async (req: any, res: any, next: any) => {
    try {
      const data = req.body;
      if (!data) {
        return res.status(404).json({ message: "Not data" });
      }
      const role_res = await role_service.rol(data);
      return res.status(200).json({ message: "Added role", data: role_res });
    } catch (error) {}
  },
};

export default controller;
