import sys
import json
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA

def run_forecast(data_json, forecast_steps=12, test_size_months=6, model_type='ARIMA'):
    try:
        df = pd.DataFrame(data_json)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        df = df.asfreq('M')  # Monthly frequency
        df['revenue'] = pd.to_numeric(df['revenue'])
        df.sort_index(inplace=True)
        df.ffill(inplace=True)

        # Perform ADF test
        result = adfuller(df['revenue'])
        adf_output = {
            'ADF_Statistic': result[0],
            'p_value': result[1]
        }

        # Train/test split
        if test_size_months > 0 and len(df) > test_size_months:
            train_df = df.iloc[:-test_size_months]
            test_df = df.iloc[-test_size_months:]
        else:
            train_df = df
            test_df = pd.DataFrame()

        # Use simple ARIMA model with fixed parameters
        model = ARIMA(train_df['revenue'], order=(1,1,1))
        model_fit = model.fit()

        # Evaluate on test set if provided
        evaluation_metrics = {}
        if not test_df.empty:
            start_idx = len(train_df)
            end_idx = start_idx + len(test_df) - 1
            test_predictions = model_fit.predict(start=start_idx, end=end_idx)
            test_predictions.index = test_df.index

            mae = mean_absolute_error(test_df['revenue'], test_predictions)
            mse = mean_squared_error(test_df['revenue'], test_predictions)
            rmse = np.sqrt(mse)
            mape_values = np.abs((test_df['revenue'] - test_predictions) / test_df['revenue'])
            mape = np.mean(mape_values[np.isfinite(mape_values)]) * 100
            
            evaluation_metrics = {
                'MAE': mae,
                'MSE': mse,
                'RMSE': rmse,
                'MAPE': mape
            }
        else:
            evaluation_metrics = {'message': 'No test set used for evaluation.'}

        # Forecast future values
        last_date_of_all_data = df.index[-1]
        forecast_index = pd.date_range(start=last_date_of_all_data + pd.DateOffset(months=1), periods=forecast_steps, freq='M')
        future_forecast_values = model_fit.predict(start=len(df), end=len(df) + forecast_steps - 1)

        # Prepare historical output
        historical_output = df['revenue'].reset_index().to_dict(orient='records')
        for item in historical_output:
            item['date'] = item['date'].isoformat()

        # Prepare forecast output
        forecast_output = pd.DataFrame({'date': forecast_index, 'revenue': future_forecast_values.values}).to_dict(orient='records')
        for item in forecast_output:
            item['date'] = item['date'].isoformat()

        return {
            'model_type': model_type.upper(),
            'historical': historical_output,
            'forecast': forecast_output,
            'evaluation_metrics': evaluation_metrics,
            'adf_test': adf_output
        }

    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    try:
        if len(sys.argv) > 1:
            input_data_str = sys.argv[1]
        else:
            input_data_str = sys.stdin.read()

        input_data = json.loads(input_data_str)
        revenue_data = input_data.get('revenue_data')
        forecast_periods = input_data.get('forecast_periods', 12)
        test_size_months = input_data.get('test_size_months', 6)
        model_type = input_data.get('model_type', 'ARIMA')

        if not revenue_data:
            raise ValueError("No 'revenue_data' provided in the input.")

        result = run_forecast(revenue_data, forecast_periods, test_size_months, model_type)
        print(json.dumps(result, ensure_ascii=False))

    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'Invalid JSON input: {str(e)}'}))
        sys.exit(1)
    except ValueError as ve:
        print(json.dumps({'error': str(ve)}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'error': f'An unexpected error occurred: {str(e)}'}))
        sys.exit(1)

