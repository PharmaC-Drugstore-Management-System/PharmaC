import prisma from "../utils/prisma.utils";

interface ProductTypeGroup {
  TYPE: string;
  DRUG: string[];
}

const producttypeService = {
  getProductTypes: async (): Promise<ProductTypeGroup[]> => {
    try {
      const products = await prisma.product.findMany({
        select: {
          friendlyid: true,
          producttype: true,
        },
        where: {
          friendlyid: {
            not: null,
          },
          producttype: {
            not: null,
          },
        },
      });

      // Group products by their type
      const groupedProducts = products.reduce((acc, product) => {
        const type = product.producttype!;
        const drugId = product.friendlyid!;

        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(drugId);

        return acc;
      }, {} as Record<string, string[]>);

      // Convert to desired format
      const result: ProductTypeGroup[] = Object.entries(groupedProducts).map(([type, drugs]) => ({
        TYPE: type,
        DRUG: drugs,
      }));

      return result;
    } catch (error) {
      throw new Error("Failed to fetch product types");
    }
  },
};

export default producttypeService;
