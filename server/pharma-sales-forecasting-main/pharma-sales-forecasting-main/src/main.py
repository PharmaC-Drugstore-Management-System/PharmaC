#!/usr/bin/env python3
"""
Pharmacy Sales Prediction Module - Main Entry Point
"""

import argparse
import logging
import sys
import os
import json
import numpy as np
from typing import List, Optional

# Add src directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from forecaster import Forecaster
from database_loader import PharmaDataLoader  # 🆕 Database integration
import config

def setup_logging(log_level: str = config.LOG_LEVEL) -> None:
    """Setup logging configuration."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=config.LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('pharmacy_prediction.log')
        ]
    )

def parse_arguments() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Pharmacy Sales Prediction Module',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py --use_database                     # Use backend database (recommended)
  python main.py --forecast_days 365               # Custom forecast period
  python main.py --drug_filter P01,IBU400          # Specific drugs only
  python main.py --output_path custom_predictions/ # Custom output location
  python main.py --model ARIMA                     # Use specific model
        """
    )
    
    parser.add_argument(
        '--use_database',
        action='store_true',
        default=True,
        help='Use backend database API instead of CSV files (default: True)'
    )
    
    parser.add_argument(
        '--backend_url',
        type=str,
        default='http://pharmac-server:5000/api',
        help='Backend API URL (default: http://pharmac-server:5000/api for Docker network)'
    )
    
    parser.add_argument(
        '--forecast_days',
        type=int,
        default=config.FORECAST_DAYS,
        help=f'Number of days to forecast (default: {config.FORECAST_DAYS})'
    )
    
    parser.add_argument(
        '--drug_filter',
        type=str,
        help='Comma-separated list of specific drugs to analyze (e.g., P01,IBU400,TEST009)'
    )
    
    parser.add_argument(
        '--output_path',
        type=str,
        default=config.OUTPUT_BASE_PATH,
        help=f'Output directory path (default: {config.OUTPUT_BASE_PATH})'
    )
    
    parser.add_argument(
        '--data_path',
        type=str,
        help=f'Input data directory path (fallback if database fails, optional when using --use_database)'
    )
    
    parser.add_argument(
        '--log_level',
        type=str,
        default=config.LOG_LEVEL,
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        help=f'Logging level (default: {config.LOG_LEVEL})'
    )
    
    parser.add_argument(
        '--train_ratio',
        type=float,
        default=config.TRAIN_TEST_SPLIT,
        help=f'Training data ratio for evaluation (default: {config.TRAIN_TEST_SPLIT})'
    )

    parser.add_argument(
        '--model',
        type=str,
        choices=['ARIMA', 'arima', 'Prophet', 'prophet', 'CatBoost', 'catboost'],
        help='Model to use for forecasting (ARIMA, Prophet, CatBoost) - case insensitive'
    )
    
    return parser.parse_args()

def validate_arguments(args: argparse.Namespace) -> None:
    """Validate command line arguments."""
    if args.forecast_days <= 0:
        raise ValueError("Forecast days must be positive")
    
    if not 0.1 <= args.train_ratio <= 0.9:
        raise ValueError("Train ratio must be between 0.1 and 0.9")
    
    # Only validate data_path if not using database
    if not args.use_database and args.data_path and not os.path.exists(args.data_path):
        raise FileNotFoundError(f"Data path does not exist: {args.data_path}")

def load_data_from_database(forecaster: Forecaster, backend_url: str) -> bool:
    """
    Load data from database using the backend API instead of CSV files.
    
    Args:
        forecaster: The forecaster instance to load data into
        backend_url: Backend API URL
        
    Returns:
        bool: True if successful, False otherwise
    """
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("🔄 Loading data from backend database API...")
        
        # Initialize database loader
        db_loader = PharmaDataLoader(backend_url=backend_url)
        
        # Validate backend connection first
        validation = db_loader.validate_backend_connection()
        if not validation['connected']:
            raise Exception(f"Backend connection failed: {validation['message']}")
        
        logger.info(f"✅ Backend connection validated: {validation['message']}")
        
        # Load sales data from backend
        sales_df = db_loader.load_sales_data_from_service()
        
        if sales_df.empty:
            raise Exception("No sales data retrieved from backend")
        
        # Set the data in forecaster (replace CSV loading)
        forecaster.data = sales_df
        
        logger.info(f"✅ Database data loaded successfully:")
        logger.info(f"   - Records: {len(sales_df)}")
        logger.info(f"   - Date range: {sales_df['date'].min()} to {sales_df['date'].max()}")
        
        product_cols = [col for col in sales_df.columns if col != 'date']
        logger.info(f"   - Product columns: {len(product_cols)}")
        if len(product_cols) <= 10:
            logger.info(f"   - Products: {product_cols}")
        else:
            logger.info(f"   - Sample products: {product_cols[:10]}...")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load data from backend: {e}")
        return False

def generate_clean_json_output(results: dict, args: argparse.Namespace) -> dict:
    """Generate clean, structured JSON output for API consumption."""
    import pandas as pd
    
    if not results:
        return {
            "success": False,
            "message": "No drugs were successfully processed",
            "data": {},
            "error": "No results generated"
        }
    
    clean_output = {
        "success": True,
        "metadata": {
            "forecast_days": args.forecast_days,
            "model_used": args.model if args.model else "All models",
            "drugs_processed": len(results),
            "timestamp": pd.Timestamp.now().isoformat(),
            "available_drugs": list(results.keys()),
            "data_source": "backend_database" if args.use_database else "csv_files"
        },
        "forecasts": {},
        "model_performance": {},
        "summary": {
            "total_drugs": len(results),
            "successful_predictions": 0,
            "average_data_points": 0
        }
    }
    
    total_data_points = 0
    successful_predictions = 0
    model_stats = {}
    
    # Process each drug's results
    for drug_name, drug_data in results.items():
        drug_forecasts = {}
        drug_metrics = {}
        
        # Extract predictions for each model
        predictions_data = drug_data.get('predictions', {})
        evaluation_data = drug_data.get('evaluation_results', {})
        
        for model_name in ['ARIMA', 'Prophet', 'CatBoost']:
            if model_name in predictions_data and predictions_data[model_name]:
                pred_data = predictions_data[model_name]
                
                # Convert pandas objects to serializable format
                forecast_dates = []
                forecast_values = []
                lower_bounds = []
                upper_bounds = []
                
                if hasattr(pred_data.get('dates'), '__iter__'):
                    forecast_dates = [str(date) for date in pred_data['dates']]
                
                if hasattr(pred_data.get('predictions'), '__iter__'):
                    forecast_values = [float(val) if not (np.isnan(val) or np.isinf(val)) else 0 
                                     for val in pred_data['predictions']]
                
                if pred_data.get('lower_ci') is not None and hasattr(pred_data.get('lower_ci'), '__iter__'):
                    lower_bounds = [float(val) if not (np.isnan(val) or np.isinf(val)) else 0 
                                   for val in pred_data['lower_ci']]
                
                if pred_data.get('upper_ci') is not None and hasattr(pred_data.get('upper_ci'), '__iter__'):
                    upper_bounds = [float(val) if not (np.isnan(val) or np.isinf(val)) else 0 
                                   for val in pred_data['upper_ci']]
                
                drug_forecasts[model_name] = {
                    "dates": forecast_dates,
                    "predictions": forecast_values,
                    "lower_confidence": lower_bounds,
                    "upper_confidence": upper_bounds,
                    "total_forecast_days": len(forecast_values)
                }
                
                successful_predictions += 1
            
            # Extract model metrics
            if model_name in evaluation_data and evaluation_data[model_name].get('metrics'):
                metrics = evaluation_data[model_name]['metrics']
                clean_metrics = {}
                
                for metric, value in metrics.items():
                    if not (np.isnan(value) or np.isinf(value)):
                        clean_metrics[metric] = float(value)
                
                if clean_metrics:
                    drug_metrics[model_name] = clean_metrics
                    
                    # Collect stats for summary
                    if model_name not in model_stats:
                        model_stats[model_name] = {'mae': [], 'mse': [], 'rmse': [], 'mape': []}
                    
                    for stat_name in ['mae', 'mse', 'rmse', 'mape']:
                        if stat_name in clean_metrics:
                            model_stats[model_name][stat_name].append(clean_metrics[stat_name])
        
        if drug_forecasts:
            clean_output["forecasts"][drug_name] = drug_forecasts
        
        if drug_metrics:
            clean_output["model_performance"][drug_name] = drug_metrics
        
        # Count data points for this drug
        data_points = drug_data.get('data_points', 0)
        total_data_points += data_points
    
    # Calculate summary statistics
    clean_output["summary"]["successful_predictions"] = successful_predictions
    clean_output["summary"]["average_data_points"] = total_data_points / len(results) if results else 0
    
    # Calculate model performance averages
    for model_name, stats in model_stats.items():
        if model_name not in clean_output["model_performance"]:
            clean_output["model_performance"][model_name] = {}
        
        avg_stats = {}
        for stat_name, values in stats.items():
            if values:  # Only if we have data
                avg_stats[f"avg_{stat_name}"] = sum(values) / len(values)
        
        if avg_stats:
            clean_output["model_performance"][f"{model_name}_averages"] = avg_stats
    
    return clean_output

def main() -> None:
    """Main function."""
    try:
        args = parse_arguments()
        validate_arguments(args)
        setup_logging(args.log_level)
        
        logger = logging.getLogger(__name__)
        
        # Parse drug filter if provided
        drug_filter = None
        if args.drug_filter:
            try:
                # Handle both comma-separated string and JSON array format
                if args.drug_filter.startswith('[') and args.drug_filter.endswith(']'):
                    drug_filter = json.loads(args.drug_filter)
                else:
                    drug_filter = [drug.strip() for drug in args.drug_filter.split(',')]
                logger.info(f"Drug filter applied: {drug_filter}")
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Invalid drug filter format: {e}")
                sys.exit(1)
        
        # Log configuration
        logger.info("="*60)
        logger.info("PHARMACY SALES PREDICTION MODULE")
        logger.info("="*60)
        logger.info(f"Forecast days: {args.forecast_days}")
        logger.info(f"Data source: {'Backend Database' if args.use_database else 'CSV Files'}")
        if args.use_database:
            logger.info(f"Backend URL: {args.backend_url}")
        if args.data_path:
            logger.info(f"Data path: {args.data_path}")
        logger.info(f"Output path: {args.output_path}")
        logger.info(f"Train ratio: {args.train_ratio}")
        if args.model:
            logger.info(f"Model: {args.model}")
        if drug_filter:
            logger.info(f"Drug filter: {drug_filter}")
        
        # Initialize forecaster
        forecaster = Forecaster(forecast_days=args.forecast_days)
        
        # Load data from backend database or fallback to CSV
        data_loaded = False
        
        if args.use_database:
            logger.info(f"🔄 Using backend database mode (URL: {args.backend_url})")
            data_loaded = load_data_from_database(forecaster, args.backend_url)
            
            if not data_loaded:
                logger.warning("⚠️ Database loading failed, checking for CSV fallback...")
                if args.data_path and os.path.exists(args.data_path):
                    logger.info(f"Falling back to CSV files: {args.data_path}")
                    forecaster.load_data(args.data_path)
                    data_loaded = True
                else:
                    logger.error("Database loading failed. Please check:")
                    logger.error(f"1. Backend server running at: {args.backend_url}")
                    logger.error("2. /sales/sales-volume endpoint accessible")
                    logger.error("3. Network connection")
                    raise Exception("Database loading failed - backend server not accessible")
        else:
            logger.info(f"📁 Using CSV file mode: {args.data_path}")
            if not args.data_path or not os.path.exists(args.data_path):
                raise Exception("CSV mode selected but no valid data path provided")
            forecaster.load_data(args.data_path)
            data_loaded = True
        
        if not data_loaded:
            raise Exception("Failed to load data from any source")
        
        logger.info("✅ Data loaded successfully, starting forecasting analysis...")
        
        # Run complete analysis (pass model if specified)
        results = forecaster.run_complete_analysis(
            drug_filter=drug_filter,
            model=args.model
        )
        
        if not results:
            logger.error("No results generated")
            sys.exit(1)
        
        # Generate clean JSON output for API consumption
        clean_output = generate_clean_json_output(results, args)
        
        # Output results
        output_json = json.dumps(clean_output, indent=2, ensure_ascii=False)
        
        # Print structured output for API parsing
        print("=== FORECAST_RESULTS_START ===")
        print(output_json)
        print("=== FORECAST_RESULTS_END ===")
        
        # Save to file if output path provided
        if args.output_path:
            os.makedirs(args.output_path, exist_ok=True)
            output_file = os.path.join(args.output_path, 'forecast_results.json')
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output_json)
            
            logger.info(f"✅ Results saved to: {output_file}")
        
        logger.info("✅ Pharmacy sales prediction completed successfully!")
        
    except KeyboardInterrupt:
        logger = logging.getLogger(__name__)
        logger.info("Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"FATAL ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()