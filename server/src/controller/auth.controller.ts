import auth_service from "../services/auth.service.ts";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const controller = {
  register: async (req: any, res: any, next: any) => {
    try {
      const data = req.body;
      if (!data) {
        return res.status(404).json({ message: "Register data Not found" });
      }

      const user = await auth_service.register(data);
      console.log("Response of register", user);

      const token = jwt.sign(
        {
          id: user.employee_id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          tax_id: user.tax_id,
          phonenumber: user.phonenumber,
          birthdate: user.birthdate,
          role_id: user.role_id,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      console.log("Token in regiser", token);

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(200)
        .json({ message: "Register Successfully", data: user });
    } catch (error: any) {
      console.log("Register User controller is Error");
      return res
        .status(500)
        .json({ message: "Error status 500", error: error.message });
    }
  },
  login: async (req: any, res: any, next: any) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(404).json({ message: "Email or password not found" });
      }
      const user = await auth_service.login({ email, password });
      console.log("Login controller - user from DB:", user); // Debug log
      const token = jwt.sign(
        {
          id: user.employee_id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          tax_id: user.tax_id,
          phonenumber: user.phonenumber,
          birthdate: user.birthdate,
          role_id: user.role_id,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(200)
        .json({ message: "Login Successfully", data: user });
    } catch (error) {
      console.log("Login User controller is Error");
      return res.status(500).json({ message: "Error status 500" });
    }
  },
  me: async (req: any, res: any) => {
    try {
      const user = (req as any).user;
      console.log("ME endpoint - user from JWT:", user); // Debug log
      res.status(200).json({ user });
    } catch (error: any) {
      return res
        .status(401)
        .json({ message: "Unauthorized 401", error: error.message });
    }
  },
};

export default controller;
