import inventory_service from '../services/inventory.service.ts'

const controller = {
    add : async (req:any, res:any) =>{
        try {
            const {product_name, brand, price, expiredDate} = req.body
            const exDate = new Date(expiredDate);
            if(!product_name||!brand||!price||!exDate){
                return res.status(404).json({message:'404 Not found data'})
            }
            const response = await inventory_service.add_service(product_name, brand, price, exDate);
            return res.status(200).json({message:'Added medicine into inventroy',data:response})
        } catch (error) {
            
        }
    }
}
export default controller