// server/dto/user.ts

import { Role } from '../common/types/role.enum';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  taxId: string;
  gender: string;
  phone: string;
  birthdate: string;
  role: Role;
}
