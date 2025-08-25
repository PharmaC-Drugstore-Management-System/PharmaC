import account_service from "../services/account.service.ts";

const controller = {
  // Existing account method
  account: async (req: any, res: any, next: any) => {
    try {
      const { employee_id } = req.body; 

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
        firstname,
        lastname,
        email,
        phonenumber,
        gender,
        birthdate,
        address,
        additional_info,
        country,
        province,
        storecode,
        zipcode,
      } = req.body;

      const response = await account_service.edit({
        employee_id: employee_id,
        tax_id: tax_id,
        firstname: firstname,
        lastname: lastname,
        email: email,
        phonenumber: phonenumber,
        gender: gender,
        birthdate: birthdate,
        address: address,
        additional_info: additional_info,
        country: country,
        province: province,
        storecode: storecode,
        zipcode: zipcode,
      });

      if (!response) {
        return res.status(404).json({ message: "Response in edit not found" });
      }

      return res.status(200).json({ message: "Edited", data: response });
    } catch (error) {
      console.error("Error in account controller:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  uploadProfileImage: async (req: any, res: any, next: any) => {
    try {
      console.log('=== Upload Profile Image Started ===');
      const file = req.file;
      const user = req.user; // จาก JWT token

      console.log('File:', file);
      console.log('User from JWT:', user);

      if (!file) {
        console.log('❌ No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!user) {
        console.log('❌ User not authenticated');
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Fix: ใช้ id หรือ employee_id ที่มีใน JWT token
      const employeeId = user.employee_id || user.id;
      if (!employeeId) {
        console.log('❌ No employee ID found in token');
        return res.status(400).json({ message: "Employee ID not found in token" });
      }

      // สร้าง URL สำหรับรูปภาพ
      const imageUrl = `http://localhost:5000/uploads/${file.filename}`;
      console.log('🖼️ Image URL:', imageUrl);
      console.log('👤 Employee ID:', employeeId);

      // บันทึกลงฐานข้อมูล
      console.log('💾 Saving to database...');
      const response = await account_service.updateProfileImage({
        employee_id: employeeId,
        profile_image: imageUrl,
      });

      console.log('✅ Database update response:', response);
      console.log(`🎉 Profile image uploaded and saved for user ${employeeId}: ${imageUrl}`);

      return res.status(200).json({
        message: "Profile image uploaded and saved successfully",
        data: {
          imageUrl: imageUrl,
          filename: file.filename,
          employee: response
        }
      });
    } catch (error) {
      console.error("❌ Error uploading profile image:", error);
      return res.status(500).json({ message: "Internal server error", error: error });
    }
  },

  // Get all employees for role management
  getAllEmployees: async (req: any, res: any) => {
    try {
      const response = await account_service.getAllEmployees();
      
      if (!response) {
        return res.status(404).json({ message: "No employees found" });
      }

      console.log("✅ All employees fetched successfully");
      return res.status(200).json({ 
        message: "Successfully fetched all employees", 
        data: response 
      });
    } catch (error) {
      console.error("❌ Error fetching all employees:", error);
      return res.status(500).json({ message: "Internal server error", error: error });
    }
  },

  // Update employee roles
  updateEmployeeRoles: async (req: any, res: any) => {
    try {
      const { employees } = req.body;

      if (!employees || !Array.isArray(employees)) {
        return res.status(400).json({ message: "Employees array is required" });
      }

      const response = await account_service.updateEmployeeRoles(employees);
      
      console.log("✅ Employee roles updated successfully");
      return res.status(200).json({ 
        message: "Successfully updated employee roles", 
        data: response 
      });
    } catch (error) {
      console.error("❌ Error updating employee roles:", error);
      return res.status(500).json({ message: "Internal server error", error: error });
    }
  },
};

export default controller;
