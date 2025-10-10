import prisma from "../utils/prisma.utils";
const salesDataService = {
  getSalesData: async () => {
    try {
      // 1. ดึงทุก product types ที่มี
      const productTypes = await prisma.product.findMany({
        select: { producttype: true },
        distinct: ['producttype'],
      });
      const uniqueProductTypes = productTypes
        .map((p) => p.producttype)
        .filter((type): type is string => type !== null && type !== undefined);

      // 2. ดึงทุกวันที่มี order
      const orderDatesRaw = await prisma.order.findMany({
        select: { date: true },
      });
      const uniqueDatesSet = new Set(
        orderDatesRaw.map((o) => o.date?.toISOString().slice(0, 10))
      );
      const uniqueDates = Array.from(uniqueDatesSet).sort();

      // 3. สร้าง skeleton array ตาม ProductType
      const dateArray: any[] = uniqueDates.map((dateStr) => {
        const row: any = { date: dateStr };
        uniqueProductTypes.forEach((type) => (row[type] = 0));
        return row;
      });

      // 4. ดึงยอดขายจริง พร้อม producttype
      const sales = await prisma.order_item.findMany({
        select: {
          quantity: true,
          product: { 
            select: { 
              friendlyid: true,
              producttype: true 
            } 
          },
          order: { select: { date: true } },
        },
      });

      // 5. เติมยอดขายจริง group ตาม ProductType
      sales.forEach((item) => {
        const dateStr = item.order?.date?.toISOString().slice(0, 10);
        const productType = item.product?.producttype;
        const quantity = item.quantity || 0;
        
        if (!dateStr || !productType) return;

        const row = dateArray.find((r) => r.date === dateStr);
        if (row) {
          row[productType] += quantity;
        }
      });

      console.log('Sales data by ProductType:', JSON.stringify(dateArray, null, 2));

      return dateArray;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      throw new Error("Failed to fetch sales data");
    }
  },
};
export default salesDataService;
