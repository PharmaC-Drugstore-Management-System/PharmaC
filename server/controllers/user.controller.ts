import type { Request, Response } from "express";
import { userRepo } from "../repository/user.repository";
import type { UserDto } from "../dto/user";

// Convert a UserModel to a UserDto
const toUserDto = (user: any): UserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  taxId: user.taxId,
  gender: user.gender,
  phone: user.phone,
  birthdate: user.birthdate,
  role: user.role,
});

// Controller to get all users
export const getUsers = (req: Request, res: Response): void => {
  const users = userRepo.findAll();
  const usersDto: UserDto[] = users.map(toUserDto);
  res.json(usersDto);
};

// Controller to get a user by ID
export const getUserById = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id, 10);
  const user = userRepo.findById(id);
  if (!user) {
    res.status(404).json({ message: `User with ID ${id} not found.` });
    return;
  }
  const userDto: UserDto = toUserDto(user);
  res.json(userDto);
};
