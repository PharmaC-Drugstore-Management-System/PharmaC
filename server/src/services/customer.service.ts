import { get } from "http";
import prisma from "../utils/prisma.utils";

const customer_service = {
  add: async (data: any) => {
    try {
      const newMember = await prisma.customer.create({
        data: {
          citizen_id: data.citizen_id,
          name: data.name,
          phone_number: data.phone_number,
          birthday: data.birthday ? new Date(data.birthday) : null,
          gender: data.gender,
          point: data.point || 0,
        },
      });
      return newMember;
    } catch (error: any) {
      console.error("Error in member_service.add():", error.message);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const members = await prisma.customer.findMany();
      return members;
    } catch (error: any) {
      console.error("Error in member_service.getAll():", error.message);
      throw error;
    }
  },
  
  update: async (id: number, data: any) => {
    try {
      const updatedMember = await prisma.customer.update({
        where: {
          customer_id: id,
        },
        data: {
          citizen_id: data.citizen_id,
          name: data.name,
          phone_number: data.phone_number,
          birthday: data.birthday ? new Date(data.birthday) : null,
          gender: data.gender,
          point: data.point || 0,
        },
      });
      return updatedMember;
    } catch (error: any) {
      console.error("Error in member_service.update():", error.message);
      throw error;
    }
  },
  
  getById: async (id: number) => {
    try {
      const member = await prisma.customer.findUnique({
        where: {
          customer_id: id,
        },
      });
      return member;
    } catch (error: any) {
      console.error("Error in member_service.getById():", error.message);
      throw error;
    }
  },
};

export default customer_service;
