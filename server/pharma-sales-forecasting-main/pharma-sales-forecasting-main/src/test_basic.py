#!/usr/bin/env python3
"""
Simple test script to validate basic forecasting integration without Prophet/CatBoost.
This tests ARIMA functionality only which should work with your backend data.
"""

import sys
import os
import pandas as pd
import json
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add src directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_sample_data():
    """Create sample data in your backend format for testing"""
    sample_data = []
    
    # Add 60 days of historical data for better ARIMA modeling
    base_date = datetime(2025, 8, 1)
    for i in range(60):
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        record = {
            "date": date_str,
            "P01": max(0, int(5 + (i % 7) * 2 + (i % 3))),  # Some pattern
            "AP001": max(0, int(3 + (i % 5))),
            "IBU400": max(0, int(10 + (i % 9) * 2)),  # Focus on this one
            "TEST": max(0, int(1 + (i % 6)))
        }
        sample_data.append(record)
    
    return sample_data

def test_basic_arima():
    """Test basic ARIMA forecasting functionality"""
    logger.info("📈 Testing basic ARIMA forecasting...")
    
    try:
        # Create sample data
        sample_data = create_sample_data()
        df = pd.DataFrame(sample_data)
        
        logger.info(f"Created sample dataset: {len(df)} records")
        
        # Process data
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        df.set_index('date', inplace=True)
        
        # Test with just IBU400
        product_data = df['IBU400'].dropna()
        
        logger.info(f"Testing with IBU400 - {len(product_data)} data points")
        
        # Simple ARIMA test using statsmodels
        from statsmodels.tsa.arima.model import ARIMA
        
        # Fit ARIMA model
        model = ARIMA(product_data, order=(1, 1, 1))
        fitted_model = model.fit()
        
        # Make forecast
        forecast = fitted_model.forecast(steps=7)
        
        logger.info("✅ ARIMA model fitted successfully!")
        logger.info(f"7-day forecast for IBU400: {forecast.values}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ ARIMA test failed: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

def test_data_loader():
    """Test the database loader functionality"""
    logger.info("🔌 Testing database loader...")
    
    try:
        from database_loader import PharmaDataLoader
        
        # Test initialization (won't connect but should create object)
        loader = PharmaDataLoader("http://localhost:5000")
        logger.info("✅ Database loader created successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Database loader test failed: {e}")
        return False

def main():
    """Run simplified tests"""
    logger.info("🚀 Testing Basic Pharmacy Forecasting Integration")
    logger.info("=" * 50)
    
    # Test 1: Data processing
    logger.info("Test 1: Data Processing")
    sample_data = create_sample_data()
    df = pd.DataFrame(sample_data)
    data_ok = len(df) > 0
    logger.info(f"Data Processing: {'✅' if data_ok else '❌'}")
    
    # Test 2: ARIMA functionality
    logger.info("\nTest 2: ARIMA Functionality")
    arima_ok = test_basic_arima()
    logger.info(f"ARIMA Functionality: {'✅' if arima_ok else '❌'}")
    
    # Test 3: Database loader
    logger.info("\nTest 3: Database Loader")
    loader_ok = test_data_loader()
    logger.info(f"Database Loader: {'✅' if loader_ok else '❌'}")
    
    # Summary
    logger.info("\n📋 Test Summary:")
    logger.info(f"Data Processing: {'✅' if data_ok else '❌'}")
    logger.info(f"ARIMA Functionality: {'✅' if arima_ok else '❌'}")
    logger.info(f"Database Loader: {'✅' if loader_ok else '❌'}")
    
    if data_ok and arima_ok and loader_ok:
        logger.info("\n🎉 Basic integration tests passed!")
        logger.info("\n📝 Next steps:")
        logger.info("1. Start your Node.js backend server")
        logger.info("2. Test with: python main.py --use_database --backend_url http://localhost:5000")
        logger.info("3. For full functionality, install: pip install prophet catboost")
        return True
    else:
        logger.info("\n❌ Some basic tests failed. Check error messages above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)