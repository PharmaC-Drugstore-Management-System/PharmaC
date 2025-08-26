import prisma from "../utils/prisma.utils";
const signatureService = {
  add: async (data: any) => {
    try {
      const newSignature = await prisma.po_signature.create({
        data: {
          signer_name: data.signer_name,
          cert_serial_number: data.cert_serial_number,
          signature_hash: data.signature_hash,
          signed_at: data.signed_at,
        },
      });
      return newSignature;
    } catch (error: any) {
      console.error("Error in signatureService.add():", error.message);
      throw error;
    }
  },

  // getSignature: async (id: string) => {
  //     return await prisma.po_signature.findUnique({
  //         where: { id }
  //     });
  // },
  // updateSignature: async (id: string, data: any) => {
  //     return await prisma.po_signature.update({
  //         where: { id },
  //         data
  //     });
  // },
  // deleteSignature: async (id: string) => {
  //     return await prisma.po_signature.delete({
  //         where: { id }
  //     });
  // }
};

export default signatureService;
