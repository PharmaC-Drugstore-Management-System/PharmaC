import lot_service from '../services/lot.service.ts'

const controller = {
    add : async (req:any, res:any) =>{
        try {
            const {name,amount,added_date,expired_date,cost} = req.body
            const response = await lot_service.create({
                name: name,
                amount: amount,
                added_date: added_date,
                expired_date: expired_date,
                cost: cost
            })

            return res.status(200).json({message:'Added lot successfully',data:response})

       
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(500).json({message: 'Internal server error', error: errorMessage});
        }
    },
}
export default controller