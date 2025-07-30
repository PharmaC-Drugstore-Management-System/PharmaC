// server/models/user.ts

import { Role } from '../common/types/role.enum';

export class UserModel {
  id!: number;
  name!: string;
  email!: string;
  taxId!: string;
  gender!: string;
  phone!: string;
  birthdate!: string;
  role!: Role; 

  constructor(partial: Partial<UserModel>) {
    Object.assign(this, partial);
  }
}
