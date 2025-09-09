import prisma from "../utils/prisma.utils";
import bcrypt from "bcrypt";
import googleMailer from "../utils/mailer";
let otpStore: { [email: string]: { otp: string; expires: number } } = {};
const auth_service = {
  register: async (data: any) => {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const check = await prisma.employee.findMany({
        where: {
          email: data.email,
        },
      });
      if (check.length > 0) {
        throw new Error("Email already exists");
      }

      const reg = await prisma.employee.create({
        data: {
          tax_id: data.tax_id,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          password: hashedPassword,
          phonenumber: data.phonenumber,
          gender: data.gender,
          role_id: data.role_id,
          storecode: data.storecode,
          additional_info: data.additional_info,
          zipcode: data.zipcode,
          country: data.country,
          province: data.province,
          birthdate: new Date(data.birthdate),
          address: data.address,
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
      return user;
    } catch (error: any) {
      console.error("Error in login service:", error.message);
      throw error;
    }
  },

  sendOtp: async (email: string) => {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 min expiry

      await googleMailer.sendOtp(email, otp);

      return { message: "OTP has been sent to your email." };
    } catch (error: any) {
      console.error("Error sending OTP:", error.message);
      throw new Error("Failed to send OTP.");
    }
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    try {
      const storedOtp = otpStore[data.email];

      if (
        !storedOtp ||
        storedOtp.otp !== data.otp ||
        Date.now() > storedOtp.expires
      ) {
        throw new Error("Invalid or expired OTP.");
      }

      // OTP is valid, find the user to return
      const user = await prisma.employee.findUnique({
        where: { email: data.email },
      });
      if (!user) {
        throw new Error("User not found after OTP verification.");
      }
      // Clean up the used OTP
      delete otpStore[data.email];

      return user
    } catch (error: any) {
      console.error("Error in OTP verification:", error.message);
      throw error;
    }
  },
};

export default auth_service;
