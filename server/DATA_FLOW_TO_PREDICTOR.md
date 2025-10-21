# Data Flow to Predictor Model - Complete Documentation

## Overview
This document explains what data is sent to the Python predictor model and how it flows through the system.

---

## 📊 Data Source: `/api/sales/sales-volume` Endpoint

### Route
```
GET /api/sales/sales-volume
```

### Data Structure Sent to Python Model

The Python model receives sales data in this format:

```json
{
  "status": true,
  "data": [
    {
      "date": "2024-01-01",
      "M01AB": 150,
      "M01AE": 200,
      "N02BA": 180,
      "N02BE/B": 90,
      "N05B": 120,
      "N05C": 75,
      "Tablet": 300
    },
    {
      "date": "2024-01-02",
      "M01AB": 145,
      "M01AE": 210,
      ...
    }
  ]
}
```

### Key Points:
- **Columns**: `date` + each unique `producttype` from your database
- **Values**: Sum of `quantity` for each product type on each date
- **Grouping**: Data is grouped by `producttype`, NOT by individual product ID

---

## 🔄 Complete Data Flow

### 1. **Database Query** (`salesData.service.ts`)

```typescript
// Step 1: Get all unique product types
const productTypes = await prisma.product.findMany({
  select: { producttype: true },
  distinct: ['producttype'],
});
// Result: ['M01AB', 'M01AE', 'N02BA', 'N02BE/B', 'N05B', 'N05C', 'Tablet', ...]

// Step 2: Get all order dates
const orderDatesRaw = await prisma.order.findMany({
  select: { date: true },
});
// Result: [2024-01-01, 2024-01-02, ..., 2024-10-17]

// Step 3: Get sales with product types
const sales = await prisma.order_item.findMany({
  select: {
    quantity: true,
    product: { 
      select: { 
        friendlyid: true,
        producttype: true 
      } 
    },
    order: { select: { date: true } },
  },
});

// Step 4: Aggregate by date and producttype
// For each date, sum all quantities for each product type
```

**Output Format:**
```json
[
  {
    "date": "2024-01-01",
    "M01AB": 150,      // Total quantity of all M01AB products sold
    "M01AE": 200,      // Total quantity of all M01AE products sold
    "N02BA": 180,
    "Tablet": 300
  }
]
```

---

### 2. **API Controller** (`salesData.controller.ts`)

```typescript
getSalesVolume: async (req: any, res: any) => {
  const result = await salesDataService.getSalesData();
  res.status(200).json({status: true, data: result});
}
```

Wraps the data in API response format.

---

### 3. **Python Model Request** (`predictor.service.ts`)

When you call `/api/predictor/generate`:

**Request Body:**
```json
{
  "forecastDays": 7,
  "drugFilter": ["M01AB", "M01AE", "N02BA"],
  "model": "ARIMA"
}
```

**What Happens:**
```typescript
// predictor.service.ts spawns Python process with these arguments:
const args = [
  'main.py',
  '--forecast_days', '7',
  '--drug_filter', '["M01AB","M01AE","N02BA"]',
  '--model', 'ARIMA'
];

// Python script runs with default backend URL:
// --backend_url http://localhost:5000/api (default in main.py)
```

---

### 4. **Python Script Fetches Data** (`main.py` + `database_loader.py`)

```python
# database_loader.py
def load_sales_data_from_service(self):
    # Tries these endpoints in order:
    endpoints = [
        "http://localhost:5000/api/sales/sales-volume",
        "http://localhost:5000/sales/sales-volume",
        "http://localhost:5000/api/forecast/data",
        ...
    ]
    
    # Makes GET request to backend
    response = requests.get(endpoint)
    data = response.json()
    
    # Expected format: { "status": true, "data": [...] }
    sales_data = data['data']
    
    # Converts to pandas DataFrame
    df = pd.DataFrame(sales_data)
    # Result:
    #    date        M01AB  M01AE  N02BA  N02BE/B  N05B  N05C  Tablet
    # 0  2024-01-01  150    200    180    90       120   75    300
    # 1  2024-01-02  145    210    175    85       125   80    310
```

---

## 🎯 What the Model Actually Receives

### DataFrame Structure:
```
Columns: ['date', 'M01AB', 'M01AE', 'N02BA', 'N02BE/B', 'N05B', 'N05C', 'Tablet', ...]
Index: RangeIndex
Dtype: date (datetime64), others (float64)
```

### Example Data:
```
     date        M01AB  M01AE  N02BA  N02BE/B  N05B  N05C  Tablet
0    2024-01-01  150.0  200.0  180.0  90.0     120.0 75.0  300.0
1    2024-01-02  145.0  210.0  175.0  85.0     125.0 80.0  310.0
2    2024-01-03  160.0  195.0  190.0  95.0     115.0 70.0  295.0
...
```

### Data Cleaning Applied:
1. **Date conversion**: Ensures `date` column is datetime
2. **Fill NaN**: Missing values → 0
3. **Clip negatives**: Any negative values → 0
4. **Remove zero columns**: Product types with 0 total sales are dropped
5. **Numeric conversion**: All product columns converted to float64

---

## 🔍 Important Notes

### 1. **Aggregation Level**
- Data is aggregated by **PRODUCT TYPE**, not individual products
- Example: If you have 5 products with type "M01AB":
  - Product 1 (M01AB): sold 30 units
  - Product 2 (M01AB): sold 40 units
  - Product 3 (M01AB): sold 80 units
  - **Result in data**: `"M01AB": 150` (sum of all)

### 2. **Drug Filter**
- When you specify `drugFilter: ["M01AB", "N02BA"]`
- Python model will ONLY train and forecast for those product types
- Other columns are ignored

### 3. **Date Range**
- Includes ALL dates that have at least one order
- Missing dates are NOT automatically filled (gaps will exist if no orders)

### 4. **Zero Handling**
- Days with no sales for a product type → value is 0
- Product types with NO sales ever → column is removed

---

## 🐛 Current Issue: HTTP 404 Error

### Problem:
```
Backend connection failed: HTTP 404
```

### Root Cause:
Python script is trying: `http://localhost:5000/api/sales/sales-volume`
But your route is mounted at: `/api/sales/sales-volume`

### Solution:
The route IS correct. The issue is **emoji characters** in Python logging causing `UnicodeEncodeError` on Windows, which crashes before the actual HTTP request.

**Files that need emoji removal:**
- `pharma-sales-forecasting-main/src/main.py` (lines with 🔄, ✅, ❌, ⚠️)
- `pharma-sales-forecasting-main/src/database_loader.py` (same emoji characters)

---

## 📝 Example Complete Flow

### Request:
```bash
POST /api/predictor/generate
{
  "forecastDays": 7,
  "drugFilter": ["M01AB", "M01AE"],
  "model": "ARIMA"
}
```

### Data Fetched from Database:
```sql
-- Equivalent SQL logic:
SELECT 
  o.date,
  p.producttype,
  SUM(oi.quantity) as total_quantity
FROM order_item oi
JOIN product p ON oi.product_id = p.product_id
JOIN order o ON oi.order_id = o.order_id
GROUP BY o.date, p.producttype
ORDER BY o.date
```

### Data Sent to Python:
```json
{
  "status": true,
  "data": [
    {"date": "2024-01-01", "M01AB": 150, "M01AE": 200, "N02BA": 180, ...},
    {"date": "2024-01-02", "M01AB": 145, "M01AE": 210, "N02BA": 175, ...},
    ...
  ]
}
```

### Python DataFrame (after filter):
```
     date        M01AB  M01AE
0    2024-01-01  150.0  200.0
1    2024-01-02  145.0  210.0
...
```

### Model Output:
```json
{
  "forecasts": {
    "M01AB": {
      "dates": ["2024-10-18", "2024-10-19", ..., "2024-10-24"],
      "predictions": [155, 158, 152, 160, 157, 162, 159]
    },
    "M01AE": {
      "dates": ["2024-10-18", "2024-10-19", ..., "2024-10-24"],
      "predictions": [205, 208, 210, 207, 212, 215, 209]
    }
  }
}
```

---

## ✅ Summary

**What data goes to the predictor:**
- **Time series data** of sales volumes
- **Grouped by**: Product Type (not individual products)
- **Aggregated by**: Date (sum of all quantities per product type per day)
- **Format**: JSON array → Pandas DataFrame
- **Columns**: `date` + one column per product type
- **Values**: Total quantity sold for that product type on that date

**Key takeaway**: The model predicts **product type demand**, not individual product demand.
