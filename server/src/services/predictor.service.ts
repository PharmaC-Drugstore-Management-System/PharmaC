import path from 'path'
import fs from 'fs/promises';
import { spawn } from 'child_process';

const python_path = path.join(__dirname, '../../pharma-sales-forecasting-main/pharma-sales-forecasting-main/src');
const output_path = path.join(python_path, 'output');
const venv_path = path.join(__dirname, '../../arima/venv_arima');
const python_executable = path.join(venv_path, 'Scripts', 'python.exe');

const predictorService = {

    generate: async (forecastDays: number, drugFilter: string[], model: string) => {
        try {
            const args = ['main.py'];
            if(forecastDays) {
                args.push('--forecast_days', forecastDays.toString());
            }
            if(drugFilter && drugFilter.length > 0) {
                args.push('--drug_filter', JSON.stringify(drugFilter));
            }
            if(model) {
                args.push('--model', model);
            }

            return new Promise((resolve, reject) => {
                const pythonProcess = spawn(python_executable, args, {
                    cwd: python_path,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                let stdout = '';
                let stderr = '';

                pythonProcess.stdout.on('data', (data) => {
                    stdout += data.toString();
                    console.log('Python output:', data.toString());
                });

                pythonProcess.stderr.on('data', (data) => {
                    stderr += data.toString();
                    console.error('Python error:', data.toString());
                });

                pythonProcess.on('close', async (code) => {
                    if (code === 0) {
                        try {
                            // Extract JSON output from stdout
                            const jsonMatch = stdout.match(/=== FORECAST_RESULTS_START ===\s*([\s\S]*?)\s*=== FORECAST_RESULTS_END ===/);
                            
                            if (jsonMatch && jsonMatch[1]) {
                                const results = JSON.parse(jsonMatch[1]);
                                resolve({
                                    success: true,
                                    results: results,
                                    logs: stdout,
                                    stderr: stderr
                                });
                            } else {
                                // Fallback to file reading if no JSON output found
                                const results = await predictorService.readOutputFiles();
                                resolve({
                                    success: true,
                                    results: results,
                                    logs: stdout,
                                    stderr: stderr,
                                    note: "Used file-based output (JSON parsing failed)"
                                });
                            }
                        } catch (error: any) {
                            reject({
                                success: false,
                                error: `Failed to parse results: ${error.message}`,
                                logs: stdout,
                                stderr: stderr,
                                raw_output: stdout
                            });
                        }
                    } else {
                        reject({
                            success: false,
                            error: `Python script failed with code ${code}: ${stderr}`,
                            logs: stdout,
                            stderr: stderr
                        });
                    }
                });

                pythonProcess.on('error', (error) => {
                    reject({
                        success: false,
                        error: `Failed to start Python process: ${error.message}`
                    });
                });
            });
        } catch (error) {
            console.error("Error occurred while generating prediction:", error);
            throw error;
        }
    },

    readOutputFiles: async () => {
        try {
            const results: any = {};

            // Check and read forecasts.json
            const forecastsPath = path.join(output_path, 'forecasts.json');
            if (await predictorService.fileExists(forecastsPath)) {
                const forecastsData = await fs.readFile(forecastsPath, 'utf-8');
                results.forecasts = JSON.parse(forecastsData);
            }

            // Check and read metrics.json
            const metricsPath = path.join(output_path, 'metrics.json');
            if (await predictorService.fileExists(metricsPath)) {
                const metricsData = await fs.readFile(metricsPath, 'utf-8');
                results.metrics = JSON.parse(metricsData);
            }

            // Check and read model_info.json
            const modelInfoPath = path.join(output_path, 'model_info.json');
            if (await predictorService.fileExists(modelInfoPath)) {
                const modelInfoData = await fs.readFile(modelInfoPath, 'utf-8');
                results.model_info = JSON.parse(modelInfoData);
            }

            return results;
        } catch (error) {
            console.error('Error reading output files:', error);
            throw error;
        }
    },

    fileExists: async (filePath: string) => {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    },

    checkStatus: async () => {
        try {
            // Check if output directory exists
            const outputExists = await predictorService.fileExists(output_path);
            
            // Check if any output files exist
            const forecastsExists = await predictorService.fileExists(path.join(output_path, 'forecasts.json'));
            const metricsExists = await predictorService.fileExists(path.join(output_path, 'metrics.json'));
            const modelInfoExists = await predictorService.fileExists(path.join(output_path, 'model_info.json'));

            return {
                python_path_exists: await predictorService.fileExists(python_path),
                python_executable_exists: await predictorService.fileExists(python_executable),
                venv_path_exists: await predictorService.fileExists(venv_path),
                output_directory_exists: outputExists,
                output_files: {
                    forecasts: forecastsExists,
                    metrics: metricsExists,
                    model_info: modelInfoExists
                }
            };
        } catch (error) {
            console.error('Error checking status:', error);
            throw error;
        }
    },
    
}

export default predictorService