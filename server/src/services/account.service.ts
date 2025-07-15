import prisma from "../utils/prisma.utils";

const account_service = {
  account: async (data: any) => {
    try {
      const getacc = await prisma.employee.findUnique({
        where: {
          employee_id: data.employee_id,
        },
      });
      return getacc;
    } catch (error) {
      console.log("Error in account service");
      throw error;
    }
  },
  edit: async (data: any) => {
    try {
      const editacc = await prisma.employee.update({
        where: {
          employee_id: data.employee_id,
        },
        data: {
          name: data.name,
          email: data.email,
          tax_id: data.tax_id,
          phonenumber: data.phonenumber,
          gender: data.gender,
          birthdate: new Date(data.birthdate),
          address: data.address,
        },
      });
      if(!editacc){
        throw new Error('Error to edit')
      }
      return editacc
    } catch (error) {
      console.log("Error in account service");
      throw error;
    }
  },
};

export default account_service;
