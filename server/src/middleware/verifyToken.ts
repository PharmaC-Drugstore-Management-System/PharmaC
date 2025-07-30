// src/middleware/verifyToken.ts
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET as string;

export const verifyToken = (req: any, res: any, next:any) => {
  const token = req.cookies?.token;
  console.log('token = ',token)
  console.log('JWT = ',JWT_SECRET)
  
  if (!token) return res.status(401).json({ message: 'Unauthorized: no token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.log(err)
    return res.status(403).json({ message: 'Invalid token' ,error:err});
  }
};
