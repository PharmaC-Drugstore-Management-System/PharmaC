import account_service from "../services/account.service.ts";

const controller = {
  account: async (req: any, res: any, next: any) => {
    try {
      const { employee_id } = req.body; // or req.params if sent as a URL param

      if (!employee_id) {
        return res.status(400).json({ message: "Employee ID is required" });
      }

      const response = await account_service.account({
        employee_id: employee_id,
      });

      if (!response) {
        return res.status(404).json({ message: "Employee not found" });
      }
      console.log(response);
      return res
        .status(200)
        .json({ message: "Successfully fetched account", data: response });
    } catch (error) {
      console.error("Error in account controller:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  edit_account: async (req: any, res: any, next: any) => {
    try {
      const {
        employee_id,
        tax_id,
        name,
        email,
        phonenumber,
        gender,
        birthdate,
        address,
      } = req.body;

      const response = await account_service.edit({
        employee_id : employee_id,
        tax_id : tax_id,
        name : name,
        email : email,
        phonenumber : phonenumber,
        gender : gender ,
        birthdate : birthdate,
        address : address
      })

      if(!response){
        return res.status(404).json({ message: "Response in edit not found" });
      }

      return res.status(200).json({message:'Edited', data : response})

    } catch (error) {
      console.error("Error in account controller:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default controller;
