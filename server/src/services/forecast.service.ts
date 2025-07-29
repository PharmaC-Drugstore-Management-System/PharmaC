// server/src/services/forecastService.ts
import { spawn } from 'child_process';
import path from 'path';

interface HistoricalData {
  date: string;
  revenue: number;
}

interface ForecastResult {
  historical: HistoricalData[];
  forecast: HistoricalData[];
  error?: string;
  details?: string;
  rawOutput?: string;
  evaluation_metrics?: {
    MAE?: number;
    MSE?: number;
    RMSE?: number;
    MAPE?: number;
    message?: string;
  };
  test_predictions?: HistoricalData[];
}

const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE || path.join(__dirname, '../../arima/venv_arima/Scripts/python.exe');
const ARIMA_SCRIPT_PATH = path.join(__dirname, '../../arima/arima.model.py');

const forecast_service = {
  getForecastService: async (
    historicalData: HistoricalData[],
    forecastPeriods: number = 12,
    testSizeMonths: number = 6
  ): Promise<ForecastResult> => {
    return new Promise((resolve, reject) => {
      const inputData = JSON.stringify({
        revenue_data: historicalData,
        forecast_periods: forecastPeriods,
        test_size_months: testSizeMonths,
      });

      console.log(`Attempting to run Python executable at: ${PYTHON_EXECUTABLE}`);
      console.log(`Running script: ${ARIMA_SCRIPT_PATH}`);

      const pythonProcess = spawn(PYTHON_EXECUTABLE, [ARIMA_SCRIPT_PATH]);

      let pythonOutput = '';
      let pythonError = '';

      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data: Buffer) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        pythonError += data.toString();
        console.error(`Python Error (stderr): ${data.toString()}`);
      });

      pythonProcess.on('close', (code: number) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          console.error(`Full Python Error Output: ${pythonError}`);
          return reject({ error: 'Failed to run ARIMA model', details: pythonError || 'Unknown Python error' });
        }

        try {
          const result: ForecastResult = JSON.parse(pythonOutput);
          if (result.error) {
            return reject({ error: 'ARIMA model error', details: result.error, rawOutput: result.rawOutput || pythonOutput });
          }
          resolve(result);
        } catch (parseError: any) {
          console.error(`Failed to parse Python output: ${parseError}`);
          console.error(`Raw Python output: ${pythonOutput}`);
          reject({ error: 'Failed to parse ARIMA model output', details: parseError.message, rawOutput: pythonOutput });
        }
      });

      pythonProcess.on('error', (err: Error) => {
        console.error('Failed to start python process:', err);
        reject({ error: 'Failed to start Python process', details: err.message });
      });
    });
  }
};

export default forecast_service;