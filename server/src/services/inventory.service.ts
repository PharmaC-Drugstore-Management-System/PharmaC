import prisma from "../utils/prisma.utils";
const inventory_service = {
  add_service: async (
    product_name: string,
    product_generic_name:string,
    brand: string,
    friendlyid: string,
    barcode: string,
    iscontrolled: boolean,
    product_type: string,
    unit: string,
    image?: string | null
  ) => {
    try {
      const add = await prisma.product.create({
        data: {
          product_name: product_name,
          generic_name: product_generic_name,
          brand: brand,
          friendlyid: friendlyid,
          barcode: barcode,
          iscontrolled: iscontrolled,
          producttype: product_type,
          unit: unit,
          image: image,
        },
      });
      return add;
    } catch (error: any) {
      console.error("Error in inventory_service.regis():", error.message);
      throw error;
    }
  },

  get_service: async () => {
    try {
      const get = await prisma.product.findMany({
        include: {
          lot: {
            select: {
              lot_id: true,
              lot_no: true,
              init_amount: true,
              added_date: true,
              expired_date: true,
              cost: true,
              sell_price:true,
            }
          }
        }
      });
      return get;
    } catch (error: any) {
      console.error("Error in inventory_service.get_service():", error.message);
      throw error;
    }
  },
  getById_service: async (id: number) => {
    try {
      const product = await prisma.product.findUnique({
        where: { product_id : Number(id) },
      });

      return product;
    } catch (error: any) {
      console.error(
        "Error in inventory_service.getById_service():",
        error.message
      );
      throw error;
    }
  },

  delete_service: async (id: number) => {
    try {
      // Check if product has been used in orders or has transactions
      const orderItems = await prisma.order_item.findMany({
        where: { product_id: Number(id) },
      });

      const lots = await prisma.lot.findMany({
        where: { product_id: Number(id) },
        include: {
          stock_transaction: true,
        },
      });

      const hasStockTransactions = lots.some(
        (lot) => lot.stock_transaction && lot.stock_transaction.length > 0
      );

      // If product has history, use SOFT DELETE instead
      if (orderItems.length > 0 || hasStockTransactions) {
        const softDeleted = await prisma.product.update({
          where: { product_id: Number(id) },
          data: {
            is_active: false,
            deleted_at: new Date(),
          },
        });

        return {
          ...softDeleted,
          _softDeleted: true,
          _reason: orderItems.length > 0
            ? `Product deactivated (used in ${orderItems.length} order(s))`
            : `Product deactivated (has transaction history)`,
        };
      }

      // If no history, safe to HARD DELETE
      // Delete related lots first
      await prisma.lot.deleteMany({
        where: { product_id: Number(id) },
      });

      // Delete the product permanently
      const deleted = await prisma.product.delete({
        where: { product_id: Number(id) },
      });

      return {
        ...deleted,
        _hardDeleted: true,
      };
    } catch (error: any) {
      console.error(
        "Error in inventory_service.delete_service():",
        error.message
      );
      throw error;
    }
  },
};

export default inventory_service;
