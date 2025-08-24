import prisma from "../utils/prisma.utils";
const orderService = {
    create : async(product_id: number, employee_id: number, membership_id: number, total_amount: number, total_price: number) => {
        try {
            const create = await prisma.order.create({
                data: {
                    employee_id: employee_id,
                    total_amount: total_amount,
                    total_price: total_price,
                    
                }
            });
            return create;
        } catch (error) {
            throw error;
        }
    }
}
export default orderService