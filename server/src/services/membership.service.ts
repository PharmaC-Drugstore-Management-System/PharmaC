import prisma from "../utils/prisma.utils";

const member_service = {
  add_service: async (data: any) => {
    const newMember = await prisma.membership.create({
      data: {
        membership_id: data.membership_id,
        point: data.point,
      },
    });
    return newMember;
  },
  get_service: async () => {
    const member = await prisma.membership.findMany();
    return member;
  },
  // update_service: async (id, data) => {
  //     const updatedMember = await prisma.member.update({
  //         where: { id },
  //         data
  //     });
  //     return updatedMember;
  // },
  // delete_service: async (id) => {
  //     const deletedMember = await prisma.member.delete({
  //         where: { id }
  //     });
  //     return deletedMember;
  // }
};

export default member_service;
