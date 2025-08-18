import prisma from "../utils/prisma.utils";
const role_service = {
  editrole_service: async (employee_id: number, role_id_fk: number) => {
    try {
      const check = await prisma.employee.findUnique({where:{employee_id}})
      if(!check){
        throw new Error('Not found employee_id in database')
      }
      const checkrole = await prisma.role.findUnique({where:{role_id:role_id_fk}})
      if(!checkrole){
        throw new Error('Not found role id to update')
      }

      const edit = await prisma.employee.update({
        where: { employee_id },
        data: { role_id: role_id_fk },
      });
      if(!edit){
        throw new Error('Cannot edit role in role service')
      }
      return edit;
    } catch (error: any) {
      console.error("Error in role_service.editrole_service():", error.message);
      throw error;
    }
  },
  rol: async (data: any) => {
      try {
        const rolCreate = await prisma.role.create({
          data: {
            role_id: data.role_id,
            role_name: data.role_name,
          },
        });
        if (!rolCreate) {
            throw new Error('Cannot add role in database')
        }
        return rolCreate;
      } catch (error) {
        throw error;
      }
    },
};

export default role_service
