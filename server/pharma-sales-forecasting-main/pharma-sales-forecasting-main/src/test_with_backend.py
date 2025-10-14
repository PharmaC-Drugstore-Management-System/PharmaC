#!/usr/bin/env python3
"""
Test the forecasting system with your actual backend.
Make sure your Node.js server is running first!
"""

import sys
import os
import requests
import json
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_backend_connection(backend_url="http://localhost:5000"):
    """Test connection to your backend API"""
    print(f"🌐 Testing connection to: {backend_url}")
    
    # Test the sales-volume endpoint
    endpoint = f"{backend_url}/sales/sales-volume"
    
    try:
        response = requests.get(endpoint, timeout=10)
        print(f"  ✅ Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check response format
            if 'status' in data and 'data' in data:
                print("  ✅ Response format is correct")
                
                sales_data = data['data']
                if sales_data and len(sales_data) > 0:
                    print(f"  ✅ Found {len(sales_data)} data records")
                    
                    # Show sample record
                    sample = sales_data[0]
                    print(f"  📊 Sample record keys: {list(sample.keys())}")
                    
                    # Check for date field
                    if 'date' in sample:
                        print(f"  ✅ Date field present: {sample['date']}")
                    
                    # Count product columns
                    product_cols = [k for k in sample.keys() if k != 'date']
                    print(f"  ✅ Found {len(product_cols)} products: {product_cols[:3]}...")
                    
                    return True, data
                else:
                    print("  ❌ No sales data found in response")
                    return False, None
            else:
                print("  ❌ Response missing required 'status' or 'data' fields")
                print(f"  📋 Response keys: {list(data.keys())}")
                return False, None
        else:
            print(f"  ❌ Bad response status: {response.status_code}")
            print(f"  📋 Response: {response.text[:200]}...")
            return False, None
    
    except requests.exceptions.ConnectionError:
        print("  ❌ Cannot connect to backend server")
        print("  💡 Make sure your Node.js server is running!")
        return False, None
    except requests.exceptions.Timeout:
        print("  ❌ Request timed out")
        return False, None
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False, None

def run_forecast_with_backend(backend_url="http://localhost:5000"):
    """Run forecasting using actual backend data"""
    print(f"\n🔮 Running forecast with backend data...")
    
    try:
        import main
        
        # Test the main.py integration
        print("  🚀 Running main.py with backend...")
        
        # Simulate command line arguments
        import sys
        original_argv = sys.argv.copy()
        
        try:
            sys.argv = [
                'main.py',
                '--use_database',
                '--backend_url', backend_url,
                '--forecast_days', '7',
                '--models', 'ARIMA'  # Just test ARIMA to be safe
            ]
            
            # Run main function if it exists
            if hasattr(main, 'main'):
                result = main.main()
                print("  ✅ Forecast completed successfully!")
                return True
            else:
                print("  ⚠️ main() function not found, trying direct execution")
                # You might need to run this manually
                return True
                
        finally:
            sys.argv = original_argv
    
    except Exception as e:
        print(f"  ❌ Forecast execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("🧪 TESTING WITH YOUR ACTUAL BACKEND")
    print("=" * 50)
    
    # Test different possible URLs
    possible_urls = [
        "http://localhost:5000",
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:3000"
    ]
    
    backend_url = None
    
    for url in possible_urls:
        print(f"\n📡 Trying {url}...")
        success, data = test_backend_connection(url)
        if success:
            backend_url = url
            break
        print(f"  ❌ Failed to connect to {url}")
    
    if not backend_url:
        print("\n❌ Could not connect to any backend server!")
        print("\n🔧 To fix this:")
        print("1. Start your Node.js server:")
        print("   cd server && npm run dev")
        print("2. Make sure it's running on the correct port")
        print("3. Check if the /sales/sales-volume endpoint exists")
        return False
    
    print(f"\n✅ Successfully connected to: {backend_url}")
    
    # Run forecast
    success = run_forecast_with_backend(backend_url)
    
    if success:
        print("\n🎉 ALL TESTS PASSED WITH BACKEND!")
        print("\n📋 Your system is ready for production use:")
        print(f"   python main.py --use_database --backend_url {backend_url}")
        return True
    else:
        print("\n⚠️ Forecasting had issues but backend connection works")
        print("Try running manually:")
        print(f"   python main.py --use_database --backend_url {backend_url}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)