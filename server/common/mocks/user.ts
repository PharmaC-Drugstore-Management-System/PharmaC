// server/common/mock/user.mock.ts

import { UserModel } from "../../models/user";
import { Role } from "../types/role.enum"

export const users: UserModel[] = [
  new UserModel({
    id: 10001,
    name: "Tanon Peerakul",
    email: "tanon.p@pharmac.co",
    taxId: "3100701234567",
    gender: "Male",
    phone: "0891234567",
    birthdate: "1992-07-15",
    role: Role.OWNER
  }),
  new UserModel({
    id: 10002,
    name: "Siriya S.",
    email: "siriya@pharmac.co",
    taxId: "3100807654321",
    gender: "Female",
    phone: "0899876543",
    birthdate: "1993-04-20",
    role: Role.PHARMACIST
  })
];