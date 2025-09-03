import forecast_service from '../services/forecast.service';
import revenueService from '../services/revenue.service';

const controller = {
    getForecastRevenue: async (req: any, res: any) => {
        try {
            let historicalData: { date: string; revenue: number }[];

            try {
                // Get monthly revenue data from the API instead of mock file
                historicalData = await revenueService.getMonthlyRevenue();
                console.log(`Loaded ${historicalData.length} monthly revenue records from database`);
                
                // Validate that we have enough data for forecasting
                if (historicalData.length < 12) {
                    return res.status(400).json({ 
                        error: 'Insufficient historical data for forecasting', 
                        details: `Need at least 12 months of data, but only ${historicalData.length} months available` 
                    });
                }
            } catch (dataError: any) {
                console.error(`Error loading monthly revenue data: ${dataError.message}`);
                return res.status(500).json({ 
                    error: 'Failed to load historical revenue data from database.', 
                    details: dataError.message 
                });
            }

            const forecastPeriods = req.body.forecastPeriods || 12;
            const testSizeMonths = req.body.testSizeMonths || 6;
            const model_type =  req.body.model_type

            console.log("Model_TYPE ====== ",model_type)

            const forecastResult = await forecast_service.getForecastService(historicalData, forecastPeriods, testSizeMonths, model_type);

            if (forecastResult.error) {
                return res.status(500).json({
                    message: 'Model processing failed',
                    error: forecastResult.error,
                    details: forecastResult.details,
                    rawOutput: forecastResult.rawOutput
                });
            }

            console.log('ARIMA Evaluation Metrics:', forecastResult.evaluation_metrics);
            return res.status(200).json(forecastResult);

        } catch (error: any) {
            console.error('Error in getForecastRevenue controller:', error);
           return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    },
};

export default controller;