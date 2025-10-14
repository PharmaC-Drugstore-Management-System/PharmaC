import predictorService from '../services/predictor.service.js'
const controller = {
    generate: async (req : any, res : any) => {
        try {
            const {forecastDays, drugFilter = [], model } = req.body
            if(!model){
                return res.status(400).json({status:false, message:'Model is required'})
            }
            console.log("Predictor generate request body", forecastDays, drugFilter, model)
            if(forecastDays <= 0) {
                return res.status(400).json({status:false, message:'Forecast days is invalid'})
            }
            const result = await predictorService.generate(forecastDays, drugFilter, model)
            return res.status(200).json({status:true, data:result})

        } catch (error) {
            return res.status(500).json({status:false, message:'Failed in predictor controller generate'})
        }
    },

    status: async (req: any, res: any) => {
        try {
            const status = await predictorService.checkStatus();
            return res.status(200).json({status: true, data: status});
        } catch (error) {
            return res.status(500).json({status: false, message: 'Failed to get predictor status'});
        }
    }
}
export default controller;