#!/usr/bin/env python3
"""
Comprehensive test script to validate backend integration for pharmacy sales forecasting.
This will test the complete integration step by step.
"""

import sys
import os
import pandas as pd
import json
from datetime import datetime, timedelta

# Add src directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_sample_data():
    """Create sample data in your backend format for testing"""
    # Sample data matching your format
    sample_data = [
        {
            "date": "2025-09-26",
            "P01": 0,
            "AP001": 0,
            "D001": 0,
            "TEST": 0,
            "TEST009": 0,
            "IBU400": 2,
            "FID-1757442281694": 0,
            "FID-1757522712655": 1
        },
        {
            "date": "2025-09-27",
            "P01": 5,
            "AP001": 2,
            "D001": 0,
            "TEST": 1,
            "TEST009": 0,
            "IBU400": 3,
            "FID-1757442281694": 1,
            "FID-1757522712655": 0
        },
        {
            "date": "2025-09-28",
            "P01": 0,
            "AP001": 0,
            "D001": 0,
            "TEST": 0,
            "TEST009": 0,
            "IBU400": 4,
            "FID-1757442281694": 0,
            "FID-1757522712655": 1
        },
        {
            "date": "2025-09-29",
            "P01": 8,
            "AP001": 0,
            "D001": 0,
            "TEST": 0,
            "TEST009": 2,
            "IBU400": 4,
            "FID-1757442281694": 0,
            "FID-1757522712655": 1
        },
        {
            "date": "2025-09-30",
            "P01": 4,
            "AP001": 9,
            "D001": 8,
            "TEST": 10,
            "TEST009": 0,
            "IBU400": 23,
            "FID-1757442281694": 2,
            "FID-1757522712655": 0
        }
    ]
    
    # Add more historical data for better forecasting (30+ days recommended)
    base_date = datetime(2025, 9, 1)
    for i in range(25):  # Add 25 more days
        date_str = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        record = {
            "date": date_str,
            "P01": max(0, int(5 + (i % 7) * 2 + (i % 3))),  # Some pattern
            "AP001": max(0, int(3 + (i % 5))),
            "D001": max(0, int(2 + (i % 4))),
            "TEST": max(0, int(1 + (i % 6))),
            "TEST009": max(0, int((i % 8))),
            "IBU400": max(0, int(10 + (i % 9) * 2)),
            "FID-1757442281694": max(0, int((i % 5))),
            "FID-1757522712655": max(0, int((i % 7)))
        }
        sample_data.insert(0, record)  # Insert at beginning for chronological order
    
    return sample_data

def test_data_processing():
    """Test data processing with your backend format"""
    logger.info("🧪 Testing data processing...")
    
    try:
        # Create sample data
        sample_data = create_sample_data()
        df = pd.DataFrame(sample_data)
        
        logger.info(f"Created sample dataset: {len(df)} records")
        logger.info(f"Date range: {df['date'].min()} to {df['date'].max()}")
        
        # Process like the forecaster would
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # Get product columns
        product_cols = [col for col in df.columns if col != 'date']
        logger.info(f"Product columns: {product_cols}")
        
        # Clean data
        for col in product_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            df[col] = df[col].clip(lower=0)
        
        # Check data quality
        total_sales = df[product_cols].sum().sum()
        logger.info(f"Total sales across all products: {total_sales}")
        
        # Show sample
        logger.info("Sample data:")
        print(df.head(3).to_string())
        
        return df, product_cols
        
    except Exception as e:
        logger.error(f"❌ Data processing test failed: {e}")
        return None, None

def test_forecaster_integration():
    """Test forecaster with backend-style data"""
    logger.info("🔮 Testing forecaster integration...")
    
    try:
        # Import forecaster
        from forecaster import Forecaster
        
        # Create sample data
        df, product_cols = test_data_processing()
        if df is None:
            return False
        
        # Initialize forecaster
        forecaster = Forecaster(forecast_days=7)  # Short forecast for testing
        
        # Set data directly (like main.py does)
        forecaster.data = df
        
        logger.info("✅ Forecaster initialized with backend data")
        
        # Test load_and_prepare_data
        combined_data, drug_names = forecaster.load_and_prepare_data()
        
        logger.info(f"✅ Data loaded successfully:")
        logger.info(f"   - Shape: {combined_data.shape}")
        logger.info(f"   - Drug names: {drug_names[:5]}{'...' if len(drug_names) > 5 else ''}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Forecaster integration test failed: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return False

def test_simple_forecast():
    """Test a simple forecast with one product"""
    logger.info("📈 Testing simple forecast...")
    
    try:
        from forecaster import Forecaster
        
        # Create sample data
        df, product_cols = test_data_processing()
        if df is None:
            return False
        
        # Initialize forecaster with a shorter forecast period
        forecaster = Forecaster(forecast_days=3)
        forecaster.data = df
        
        # Try to run analysis on just one product
        test_product = 'IBU400'  # This has good data in your sample
        
        logger.info(f"Testing forecast for product: {test_product}")
        
        try:
            results = forecaster.run_complete_analysis(
                drug_filter=[test_product],
                model='ARIMA'  # Use just ARIMA for simplicity
            )
            
            if results and test_product in results:
                logger.info("✅ Forecast completed successfully!")
                logger.info(f"Results keys: {list(results[test_product].keys())}")
                return True
            else:
                logger.warning("⚠️ Forecast completed but no results for test product")
                return False
                
        except Exception as e:
            logger.error(f"❌ Forecast execution failed: {e}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Simple forecast test failed: {e}")
        return False

def main():
    """Run all tests"""
    logger.info("🚀 Testing Pharmacy Forecasting Integration")
    logger.info("=" * 50)
    
    # Test 1: Data processing
    logger.info("Test 1: Data Processing")
    data_ok = test_data_processing()[0] is not None
    logger.info(f"Data Processing: {'✅' if data_ok else '❌'}")
    
    # Test 2: Forecaster integration
    logger.info("\nTest 2: Forecaster Integration")
    forecaster_ok = test_forecaster_integration()
    logger.info(f"Forecaster Integration: {'✅' if forecaster_ok else '❌'}")
    
    # Test 3: Simple forecast (only if previous tests pass)
    forecast_ok = False
    if data_ok and forecaster_ok:
        logger.info("\nTest 3: Simple Forecast")
        forecast_ok = test_simple_forecast()
        logger.info(f"Simple Forecast: {'✅' if forecast_ok else '❌'}")
    else:
        logger.info("\nTest 3: Skipped (previous tests failed)")
    
    # Summary
    logger.info("\n📋 Test Summary:")
    logger.info(f"Data Processing: {'✅' if data_ok else '❌'}")
    logger.info(f"Forecaster Integration: {'✅' if forecaster_ok else '❌'}")
    logger.info(f"Simple Forecast: {'✅' if forecast_ok else '❌'}")
    
    if data_ok and forecaster_ok:
        logger.info("\n🎉 Integration tests passed! Your system should work with backend data.")
        logger.info("\nTo run with your actual backend:")
        logger.info("1. Make sure your Node.js server is running")
        logger.info("2. Run: python main.py --use_database --backend_url http://localhost:5000")
        return True
    else:
        logger.info("\n❌ Some tests failed. Check the error messages above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)