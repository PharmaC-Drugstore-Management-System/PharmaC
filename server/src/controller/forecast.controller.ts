import forecast_service from '../services/forecast.service.ts';
import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(__dirname, '../../mocktest.json');

const controller = {
    getForecastRevenue: async (req: any, res: any) => {
        try {
            let historicalData: { date: string; revenue: number }[];

            try {
                const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
                historicalData = JSON.parse(rawData);
                console.log(`Loaded ${historicalData.length} records from ${DATA_FILE_PATH}`);
            } catch (fileError: any) {
                console.error(`Error reading or parsing data file: ${fileError.message}`);
                return res.status(500).json({ error: 'Failed to load historical data from file.', details: fileError.message });
            }

            const forecastPeriods = req.body.forecastPeriods || 12;
            const testSizeMonths = req.body.testSizeMonths || 6;

            const forecastResult = await forecast_service.getForecastService(historicalData, forecastPeriods, testSizeMonths);

            if (forecastResult.error) {
                return res.status(500).json({
                    message: 'ARIMA model processing failed',
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