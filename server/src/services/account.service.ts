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
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          tax_id: data.tax_id,
          phonenumber: data.phonenumber,
          gender: data.gender,
          birthdate: new Date(data.birthdate),
          address: data.address,
          additional_info: data.additional_info,
          country: data.country,
          province: data.province,
          storecode: data.storecode,
          zipcode: data.zipcode,
        },
      });
      if (!editacc) {
        throw new Error('Error to edit')
      }
      return editacc
    } catch (error) {
      console.log("Error in account service");
      throw error;
    }
  },
  
  updateProfileImage: async (data: any) => {
    try {
      console.log('=== Account Service: updateProfileImage ===');
      console.log('Input data:', data);
      
      const updateImage = await prisma.employee.update({
        where: {
          employee_id: data.employee_id,
        },
        data: {
          profile_image: data.profile_image,
        },
      });
      
      console.log('✅ Database update successful:', updateImage);
      
      if (!updateImage) {
        throw new Error('Error updating profile image');
      }
      return updateImage;
    } catch (error) {
      console.log("❌ Error in update profile image service:", error);
      throw error;
    }
  },

  // Get all employees for role management
  getAllEmployees: async () => {
    try {
      console.log('=== Account Service: getAllEmployees ===');
      
      const employees = await prisma.employee.findMany({
        select: {
          employee_id: true,
          email: true,
          firstname: true,
          lastname: true,
          role_id: true,
          profile_image: true,
          phonenumber: true,
          tax_id: true,
          address: true,
        },
        orderBy: {
          firstname: 'asc'
        }
      });
      
      console.log('✅ All employees fetched successfully:', employees.length, 'employees');
      return employees;
    } catch (error) {
      console.log("❌ Error in getAllEmployees service:", error);
      throw error;
    }
  },

  // Update employee roles (single role support)
  updateEmployeeRoles: async (employees: any[]) => {
    try {
      console.log('=== Account Service: updateEmployeeRoles ===');
      console.log('Input employees:', employees);
      
      const updatePromises = employees.map(async (emp) => {
        // Update the single role_id
        const roleId = emp.role_id || 1; // Default to Customer if no role specified
        
        console.log(`Updating employee ${emp.employee_id} to role ${roleId}`);
        
        return await prisma.employee.update({
          where: {
            employee_id: emp.employee_id,
          },
          data: {
            role_id: roleId,
          },
        });
      });
      
      const results = await Promise.all(updatePromises);
      
      console.log('✅ Employee roles updated successfully:', results.length, 'employees');
      return results;
    } catch (error) {
      console.log("❌ Error in updateEmployeeRoles service:", error);
      throw error;
    }
  },
};

export default account_service;
