import orderService from "../services/order.services"
const controller = {
    createOrder : async (req: any , res: any) => {
        try {
            const {product_id, employee_id, membership_id,total_amount, total_price} = req.body
            if (!product_id || !employee_id) {
                return res.status(400).json({ error: "cart_id is required" });
            }
            const response = await orderService.create(product_id, employee_id, membership_id, total_amount, total_price)
            return res.status(200).json({status:true, data:response});
        } catch (error) {
            
        }
    }
}
export default controller