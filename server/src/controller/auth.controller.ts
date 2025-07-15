import { error } from 'console'
import auth_service from '../services/auth.service.ts'

const controller = {
    register: async(req : any , res : any ,next : any) =>{
        try {
            const data = req.body
            if(!data){
                return res.status(404).json({message:'Register data Not found'})
            }
            const response =  await auth_service.register(data)
            console.log('Response of register', response)
            return res.status(200).json({message:'Successfully', data: response})
            
        } catch (error) {
            console.log('Register User controller is Error')
            return res.status(500).json({message:'Error status 500'})
        }
    },
    login: async(req : any, res : any, next : any) =>{
        try {
            const {email,password} = req.body
            if(!email || !password) {
                return res.status(404).json({message:'Email or password not found'})
            }
            const response = await auth_service.login({ email, password })

            return res.status(200).json({message:'Login successfully', data : response})
            
        } catch (error) {
            console.log('Register User controller is Error')
            return res.status(500).json({message:'Error status 500'})
        }
    },
}

export default controller