// server/repository/user.repository.ts

import { UserModel } from "../models/user";
import { users as mockUsers } from "../common/mocks/user"; // adjust path if needed

export class UserRepository {
  private users: UserModel[] = [...mockUsers];

  create(userData: Partial<UserModel>): UserModel {
    const newUser = new UserModel(userData);
    this.users.push(newUser);
    return newUser;
  }

  findAll(): UserModel[] {
    return this.users;
  }

  findById(id: number): UserModel | undefined {
    return this.users.find((user) => user.id === id);
  }

  update(id: number, updateData: Partial<UserModel>): UserModel | undefined {
    const user = this.findById(id);
    if (user) Object.assign(user, updateData);
    return user;
  }

  delete(id: number): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}


export const userRepo = new UserRepository();
