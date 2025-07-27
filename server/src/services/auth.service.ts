import prisma from "../utils/prisma.utils";
import bcrypt from "bcrypt";

const auth_service = {
  register: async (data: any) => {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const reg = await prisma.employee.create({
        data: {
          employee_id: data.employee_id,
          tax_id: data.tax_id,
          name: data.name,
          email: data.email,
          password: hashedPassword,
          phonenumber: data.phonenumber,
          gender: data.gender,
          birthdate: new Date(data.birthdate),
          address: data.address,
          role_id_fk: data.role_id_fk,
        },
      });
      return reg;
    } catch (error: any) {
      console.error("Error in register_service.regis():", error.message);
      throw error;
    }
  },
  login: async (data: { email: string; password: string }) => {
    try {
      const user = await prisma.employee.findUnique({
        where: { email: data.email },
      });

      if (!user || !user.password) {
        throw new Error("User not found or password is missing");
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        throw new Error("Password is invalid!");
      }
      return isMatch;
    } catch (error: any) {
      console.error("Error in login service:", error.message);
      throw error;
    }
  },
};

export default auth_service;
