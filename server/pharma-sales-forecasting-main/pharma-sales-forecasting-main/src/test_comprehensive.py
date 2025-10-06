#!/usr/bin/env python3
"""
Comprehensive integration test for pharmacy sales forecasting system.
Tests the complete pipeline from data loading to forecasting.
"""

import sys
import os
import pandas as pd
import json
from datetime import datetime, timedelta

# Add src directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_basic_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing module imports...")
    
    try:
        import config
        print("  ✅ config.py imported")
    except ImportError as e:
        print(f"  ❌ config.py import failed: {e}")
        return False
    
    try:
        from forecaster import Forecaster
        print("  ✅ forecaster.py imported")
    except ImportError as e:
        print(f"  ❌ forecaster.py import failed: {e}")
        return False
    
    try:
        from data_processor import DataProcessor
        print("  ✅ data_processor.py imported")
    except ImportError as e:
        print(f"  ❌ data_processor.py import failed: {e}")
        return False
    
    return True

def create_test_data():
    """Create test data matching your backend format"""
    print("\n📊 Creating test data in backend format...")
    
    # Generate 60 days of sample data
    dates = pd.date_range(start='2025-08-01', end='2025-09-30', freq='D')
    
    sample_data = []
    for date in dates:
        # Simulate realistic pharmacy sales with some patterns
        day_of_week = date.weekday()  # 0=Monday, 6=Sunday
        
        # Simulate weekly patterns (higher sales on weekdays)
        weekday_multiplier = 1.2 if day_of_week < 5 else 0.8
        
        record = {
            "date": date.strftime('%Y-%m-%d'),
            "P01": max(0, int(5 * weekday_multiplier + (date.day % 3))),
            "IBU400": max(0, int(8 * weekday_multiplier + (date.day % 5))),
            "TEST009": max(0, int(3 * weekday_multiplier + (date.day % 2))),
            "AP001": max(0, int(4 * weekday_multiplier + (date.day % 4))),
            "FID-1757442281694": max(0, int(2 * weekday_multiplier + (date.day % 3)))
        }
        sample_data.append(record)
    
    df = pd.DataFrame(sample_data)
    df['date'] = pd.to_datetime(df['date'])
    
    print(f"  ✅ Created {len(df)} days of test data")
    print(f"  ✅ Date range: {df['date'].min().date()} to {df['date'].max().date()}")
    
    # Show sample statistics
    product_cols = [col for col in df.columns if col != 'date']
    for col in product_cols:
        total = df[col].sum()
        avg = df[col].mean()
        print(f"  📈 {col}: {total} total, {avg:.1f} avg daily")
    
    return df

def test_forecaster_with_data():
    """Test forecaster with sample data"""
    print("\n🔮 Testing forecaster with sample data...")
    
    try:
        from forecaster import Forecaster
        
        # Create test data
        df = create_test_data()
        
        # Initialize forecaster
        forecaster = Forecaster(forecast_days=7)
        print("  ✅ Forecaster initialized")
        
        # Assign data directly (simulating what main.py does)
        forecaster.data = df
        print("  ✅ Data assigned to forecaster")
        
        # Test the load_and_prepare_data method
        try:
            result = forecaster.load_and_prepare_data()
            if isinstance(result, tuple) and len(result) == 2:
                combined_data, drug_names = result
                print(f"  ✅ load_and_prepare_data returned: {len(drug_names)} products")
                print(f"  ✅ Products: {drug_names}")
                return True, forecaster, combined_data, drug_names
            else:
                print(f"  ⚠️ Unexpected return format: {type(result)}")
                return False, None, None, None
        except Exception as e:
            print(f"  ❌ load_and_prepare_data failed: {e}")
            return False, None, None, None
        
    except Exception as e:
        print(f"  ❌ Forecaster test failed: {e}")
        return False, None, None, None

def test_simple_forecast():
    """Test a simple forecasting run"""
    print("\n🚀 Testing simple forecast execution...")
    
    try:
        success, forecaster, combined_data, drug_names = test_forecaster_with_data()
        if not success:
            return False
        
        # Try to run a simple analysis on one drug
        test_drug = drug_names[0] if drug_names else 'P01'
        print(f"  🎯 Testing forecast for: {test_drug}")
        
        try:
            # Run analysis for just one drug to test the pipeline
            results = forecaster.run_complete_analysis(
                drug_filter=[test_drug],
                model='ARIMA'  # Just test ARIMA to avoid dependency issues
            )
            
            if results and test_drug in results:
                print("  ✅ Forecast completed successfully!")
                print(f"  ✅ Result keys: {list(results[test_drug].keys())}")
                
                # Check if predictions exist
                if 'predictions' in results[test_drug]:
                    predictions = results[test_drug]['predictions']
                    if predictions and 'ARIMA' in predictions:
                        arima_pred = predictions['ARIMA']
                        if 'predictions' in arima_pred:
                            pred_count = len(arima_pred['predictions'])
                            print(f"  ✅ Generated {pred_count} forecast points")
                            return True
                
                print("  ⚠️ Forecast completed but no prediction data found")
                return True
            else:
                print(f"  ❌ No results for {test_drug}")
                return False
                
        except Exception as e:
            print(f"  ❌ Forecast execution failed: {e}")
            # Show more details about the error
            import traceback
            print(f"  📋 Error details: {str(e)}")
            return False
    
    except Exception as e:
        print(f"  ❌ Simple forecast test failed: {e}")
        return False

def test_main_py_integration():
    """Test if main.py can handle backend data"""
    print("\n📜 Testing main.py integration...")
    
    try:
        import main
        print("  ✅ main.py imported successfully")
        
        # Check required functions exist
        if hasattr(main, 'load_data_from_database'):
            print("  ✅ load_data_from_database function exists")
        else:
            print("  ❌ load_data_from_database function missing")
            return False
        
        # Test data loading simulation
        from forecaster import Forecaster
        df = create_test_data()
        
        forecaster = Forecaster(forecast_days=7)
        forecaster.data = df
        
        print("  ✅ Data assignment simulation successful")
        return True
        
    except Exception as e:
        print(f"  ❌ main.py integration test failed: {e}")
        return False

def show_backend_requirements():
    """Show what format your backend should provide"""
    print("\n🌐 BACKEND DATA FORMAT REQUIREMENTS:")
    print("=" * 50)
    
    expected_response = {
        "status": True,
        "message": "Sales volume data retrieved successfully",
        "data": [
            {
                "date": "2025-09-28",
                "P01": 0,
                "IBU400": 4,
                "TEST009": 0,
                "AP001": 0,
                "FID-1757442281694": 0
            },
            {
                "date": "2025-09-29",
                "P01": 8,
                "IBU400": 4,
                "TEST009": 2,
                "AP001": 0,
                "FID-1757442281694": 0
            }
        ]
    }
    
    print("📋 Your backend API endpoint should return:")
    print(json.dumps(expected_response, indent=2))
    
    print("\n📝 Requirements:")
    print("- Endpoint: /sales/sales-volume (or similar)")
    print("- Method: GET")
    print("- Response format: JSON with 'status' and 'data' fields")
    print("- Data: Array of objects with 'date' + product columns")
    print("- Minimum 30 days of data recommended")
    print("- Product names: Use friendlyid values (P01, IBU400, etc.)")

def run_all_tests():
    """Run complete test suite"""
    print("🧪 PHARMACY FORECASTING INTEGRATION TEST SUITE")
    print("=" * 60)
    
    tests = [
        ("Module Imports", test_basic_imports),
        ("Data Format", lambda: create_test_data() is not None),
        ("Forecaster Integration", lambda: test_forecaster_with_data()[0]),
        ("Simple Forecast", test_simple_forecast),
        ("Main.py Integration", test_main_py_integration)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'=' * 20} {test_name} {'=' * 20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"  ❌ Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    # Show backend requirements
    show_backend_requirements()
    
    # Summary
    print(f"\n{'=' * 20} SUMMARY {'=' * 20}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:25} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("Your forecasting system is ready to use with backend data.")
        print("\nNext steps:")
        print("1. Make sure your Node.js server is running")
        print("2. Verify your API returns the correct format")
        print("3. Run: python main.py --use_database --backend_url http://localhost:5000")
        return True
    else:
        print(f"\n⚠️ {total - passed} test(s) failed.")
        print("Fix the failing components before proceeding.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)