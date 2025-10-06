# 🚀 Postman Testing Guide for Pharmacy Forecasting API

## 📋 **Prerequisites**
1. **Start your Node.js server:**
   ```bash
   cd server
   npm run dev
   ```
   Server should be running on `http://localhost:5000` (or your configured port)

2. **Verify backend data endpoint works:**
   - First test the sales data endpoint to ensure data is available

---

## 🧪 **API Endpoints to Test**

### 1. **Test Sales Data Endpoint (Required for forecasting)**

**GET** `http://localhost:5000/sales/sales-volume`

**Purpose:** Verify that your backend has sales data for forecasting

**Expected Response:**
```json
{
  "status": true,
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
```

---

### 2. **Generate Predictions (Main Forecasting Endpoint)**

**POST** `http://localhost:5000/predictor/generate`

**Headers:**
```
Content-Type: application/json
```

**Request Body Options:**

#### **Basic ARIMA Forecast (Recommended for first test):**
```json
{
  "forecastDays": 7,
  "drugFilter": ["P01", "IBU400"],
  "model": "ARIMA"
}
```

#### **All Products with Prophet:**
```json
{
  "forecastDays": 14,
  "drugFilter": [],
  "model": "Prophet"
}
```

#### **Multiple Days with CatBoost:**
```json
{
  "forecastDays": 30,
  "drugFilter": ["P01", "IBU400", "TEST009"],
  "model": "CatBoost"
}
```

#### **All Models (Comprehensive Test):**
```json
{
  "forecastDays": 7,
  "drugFilter": ["P01"],
  "model": "All"
}
```

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "forecasts": {
      "P01": {
        "predictions": {
          "ARIMA": {
            "predictions": [5.2, 4.8, 6.1, 5.5, 4.9, 5.3, 5.7],
            "confidence_intervals": {
              "lower": [3.1, 2.9, 3.8, 3.2, 2.7, 3.0, 3.4],
              "upper": [7.3, 6.7, 8.4, 7.8, 7.1, 7.6, 8.0]
            }
          }
        },
        "evaluation_results": {
          "ARIMA": {
            "mse": 2.456,
            "rmse": 1.567,
            "mae": 1.234,
            "mape": 15.67
          }
        },
        "data_points": 61,
        "zero_ratio": 0.23
      }
    }
  }
}
```

---

### 3. **Check Prediction Status**

**GET** `http://localhost:5000/predictor/status`

**Purpose:** Check if the forecasting service is available

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "service": "available",
    "last_prediction": "2025-09-30T10:30:00Z",
    "python_env": "active"
  }
}
```

---

## 🎯 **Postman Test Scenarios**

### **Scenario 1: Quick Test (Start Here)**
1. **GET** sales data endpoint → Verify data exists
2. **POST** predictor/generate with:
   ```json
   {
     "forecastDays": 7,
     "drugFilter": ["P01"],
     "model": "ARIMA"
   }
   ```

### **Scenario 2: Multiple Products**
```json
{
  "forecastDays": 14,
  "drugFilter": ["P01", "IBU400", "TEST009"],
  "model": "ARIMA"
}
```

### **Scenario 3: Different Models**
Test each model separately:
- `"model": "ARIMA"`
- `"model": "Prophet"`
- `"model": "CatBoost"`
- `"model": "All"`

### **Scenario 4: Edge Cases**
Test error handling:

**Invalid forecast days:**
```json
{
  "forecastDays": 0,
  "drugFilter": ["P01"],
  "model": "ARIMA"
}
```
Expected: `400 Bad Request`

**Missing model:**
```json
{
  "forecastDays": 7,
  "drugFilter": ["P01"]
}
```
Expected: `400 Bad Request - Model is required`

**Invalid product:**
```json
{
  "forecastDays": 7,
  "drugFilter": ["NONEXISTENT_PRODUCT"],
  "model": "ARIMA"
}
```

---

## ⏱️ **Response Time Expectations**

- **ARIMA**: 5-15 seconds
- **Prophet**: 10-30 seconds  
- **CatBoost**: 15-45 seconds
- **All Models**: 30-90 seconds

---

## 🔧 **Troubleshooting Common Issues**

### **Error: "Failed in predictor controller generate"**
- Check if Node.js server is running
- Verify Python environment is activated
- Check server logs for detailed errors

### **Error: Connection refused**
- Verify server URL and port
- Check if server is running with `npm run dev`

### **No predictions returned**
- Verify sales data endpoint returns data
- Check if products exist in your database
- Ensure minimum 30 days of historical data

### **Timeout errors**
- Increase Postman timeout to 2-3 minutes
- Try with fewer products first
- Use single model instead of "All"

---

## 📊 **Sample Postman Collection**

You can import this JSON into Postman:

```json
{
  "info": {
    "name": "Pharmacy Forecasting API",
    "description": "Test forecasting predictions"
  },
  "item": [
    {
      "name": "Get Sales Data",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/sales/sales-volume",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["sales", "sales-volume"]
        }
      }
    },
    {
      "name": "Generate ARIMA Forecast",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"forecastDays\": 7,\n  \"drugFilter\": [\"P01\", \"IBU400\"],\n  \"model\": \"ARIMA\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/predictor/generate",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["predictor", "generate"]
        }
      }
    },
    {
      "name": "Check Predictor Status",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/predictor/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["predictor", "status"]
        }
      }
    }
  ]
}
```

---

## 🎉 **Success Indicators**

✅ **Sales data endpoint returns data**
✅ **Predictor status shows "available"**  
✅ **Generate request returns forecast data**
✅ **Predictions array contains numeric values**
✅ **Confidence intervals are provided**
✅ **Evaluation metrics (MSE, RMSE, MAE) are included**

Start with the basic ARIMA test and work your way up to more complex scenarios! 🚀