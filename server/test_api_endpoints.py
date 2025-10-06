#!/usr/bin/env python3
"""
Quick API endpoint tester for your pharmacy forecasting system.
Run this to verify your endpoints work before using Postman.
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_sales_endpoint():
    """Test the sales data endpoint"""
    print("🔍 Testing Sales Data Endpoint...")
    
    url = f"{BASE_URL}/sales/sales-volume"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') and data.get('data'):
                records = len(data['data'])
                print(f"  ✅ Sales endpoint works! Found {records} records")
                
                # Show sample data structure
                if data['data']:
                    sample = data['data'][0]
                    products = [k for k in sample.keys() if k != 'date']
                    print(f"  📊 Products available: {products[:5]}...")
                    print(f"  📅 Date range: {data['data'][0]['date']} to {data['data'][-1]['date']}")
                
                return True
            else:
                print(f"  ❌ Invalid response format")
                return False
        else:
            print(f"  ❌ Status code: {response.status_code}")
            print(f"  📋 Response: {response.text[:200]}...")
            return False
    
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def test_predictor_status():
    """Test the predictor status endpoint"""
    print("\n🔍 Testing Predictor Status...")
    
    url = f"{BASE_URL}/predictor/status"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("  ✅ Predictor status endpoint works!")
            data = response.json()
            print(f"  📋 Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"  ❌ Status code: {response.status_code}")
            return False
    
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def test_prediction_generation():
    """Test the main prediction generation"""
    print("\n🔮 Testing Prediction Generation...")
    
    url = f"{BASE_URL}/predictor/generate"
    
    # Simple test payload
    payload = {
        "forecastDays": 7,
        "drugFilter": ["P01"],  # Test with one product first
        "model": "ARIMA"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"  📤 Sending request: {json.dumps(payload, indent=2)}")
        print("  ⏳ Generating forecast... (this may take 10-30 seconds)")
        
        start_time = time.time()
        response = requests.post(url, json=payload, headers=headers, timeout=120)
        end_time = time.time()
        
        duration = end_time - start_time
        print(f"  ⏱️ Request completed in {duration:.1f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('status') and data.get('data'):
                print("  ✅ Prediction generation successful!")
                
                # Check if we have forecast data
                forecast_data = data.get('data', {})
                if 'forecasts' in forecast_data:
                    forecasts = forecast_data['forecasts']
                    print(f"  📊 Forecasts generated for: {list(forecasts.keys())}")
                    
                    # Show sample prediction
                    for product, pred_data in forecasts.items():
                        if 'predictions' in pred_data:
                            predictions = pred_data['predictions']
                            for model, model_data in predictions.items():
                                if 'predictions' in model_data:
                                    pred_values = model_data['predictions']
                                    print(f"  🎯 {product} ({model}): {pred_values[:3]}... ({len(pred_values)} values)")
                                    break
                            break
                else:
                    print("  ⚠️ Response successful but no forecast data found")
                    print(f"  📋 Keys in response: {list(forecast_data.keys())}")
                
                return True
            else:
                print("  ❌ Invalid response structure")
                print(f"  📋 Response: {json.dumps(data, indent=2)[:500]}...")
                return False
        else:
            print(f"  ❌ Status code: {response.status_code}")
            print(f"  📋 Response: {response.text[:500]}...")
            return False
    
    except requests.exceptions.Timeout:
        print("  ❌ Request timed out (>120 seconds)")
        print("  💡 Try with fewer forecast days or check server performance")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def test_error_handling():
    """Test error cases"""
    print("\n🔍 Testing Error Handling...")
    
    url = f"{BASE_URL}/predictor/generate"
    headers = {"Content-Type": "application/json"}
    
    # Test missing model
    print("  🧪 Testing missing model parameter...")
    payload = {"forecastDays": 7, "drugFilter": ["P01"]}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 400:
            print("  ✅ Correctly rejected missing model")
        else:
            print(f"  ⚠️ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    # Test invalid forecast days
    print("  🧪 Testing invalid forecast days...")
    payload = {"forecastDays": 0, "drugFilter": ["P01"], "model": "ARIMA"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 400:
            print("  ✅ Correctly rejected invalid forecast days")
        else:
            print(f"  ⚠️ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

def main():
    """Run all tests"""
    print("🧪 PHARMACY FORECASTING API TESTER")
    print("=" * 50)
    print(f"Testing server at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check if server is running
    try:
        response = requests.get(BASE_URL, timeout=5)
        print("✅ Server is responding")
    except:
        print("❌ Cannot connect to server!")
        print("\n🔧 Make sure your Node.js server is running:")
        print("   cd server && npm run dev")
        return
    
    # Run tests
    tests = [
        ("Sales Data", test_sales_endpoint),
        ("Predictor Status", test_predictor_status), 
        ("Prediction Generation", test_prediction_generation),
        ("Error Handling", test_error_handling)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n❌ Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:20} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed >= 3:  # Allow error handling to fail
        print("\n🎉 API is ready for Postman testing!")
        print("\n📋 Postman Test Examples:")
        print("GET  http://localhost:5000/sales/sales-volume")
        print("POST http://localhost:5000/predictor/generate")
        print('     Body: {"forecastDays": 7, "drugFilter": ["P01"], "model": "ARIMA"}')
        print("GET  http://localhost:5000/predictor/status")
    else:
        print("\n⚠️ Fix the failing tests before using Postman")

if __name__ == "__main__":
    main()