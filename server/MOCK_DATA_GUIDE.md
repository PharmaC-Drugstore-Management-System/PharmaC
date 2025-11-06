# Mock Order Data Generation - Quick Guide

## Files Created

1. **generate_mock_orders_1year.sql** - Main data generation script
2. **arima_data_export.sql** - ARIMA-optimized export queries

## Step 1: Generate Mock Data

Run the main script to create ~5,000-7,000 orders over 1 year:

```powershell
cd C:\CapstoneProject\PharmaC\server
psql "postgresql://user:pass@host:port/database" -f generate_mock_orders_1year.sql
```

### What Gets Generated:

- **Date Range**: Last 365 days to today
- **Orders/Day**: 5-30 (varies with patterns)
- **Employee**: Fixed ID 7
- **Customers**: Random IDs 2-7
- **Products**: IDs 1, 2, 6, 8, 12, 13, 14, 15, 16, 17
- **Status**: 70% PAID, 20% PENDING, 10% CANCELLED

### ARIMA-Optimized Patterns:

✅ **Seasonal Variations**
- Winter (Nov-Feb): +30% sales (flu season)
- Spring (Mar-May): +10% sales
- Summer (Jun-Aug): -10% sales
- Fall (Sep-Oct): Normal

✅ **Weekly Cycles**
- Weekends: -30% sales
- Friday: +10% sales
- Weekdays: Normal

✅ **Growth Trend**
- 5% annual growth (linear)

✅ **Time Series Continuity**
- No gaps in dates
- Consistent patterns
- Realistic variations

## Step 2: Verify Data

After generation, check the verification queries at the end of the script:

```sql
-- Monthly summary
SELECT 
    DATE_TRUNC('month', date) as month,
    COUNT(*) as order_count
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month;
```

## Step 3: Export for ARIMA

Use queries from `arima_data_export.sql`:

### Daily Sales (Main ARIMA Input)
```sql
SELECT 
    DATE(date) as sale_date,
    SUM(total_price) as daily_revenue
FROM "order"
WHERE status = 'PAID'
GROUP BY DATE(date)
ORDER BY sale_date;
```

### Save to CSV
```bash
psql "your_db_url" -c "\copy (SELECT DATE(date) as date, SUM(total_price) as revenue FROM \"order\" WHERE status = 'PAID' GROUP BY DATE(date) ORDER BY date) TO 'sales_data.csv' WITH CSV HEADER"
```

## Step 4: ARIMA Model Configuration

### Recommended Parameters:

**For Daily Predictions:**
- ARIMA(1, 1, 1) with seasonal (7, 1, 1)[7]
- Weekly seasonality captured

**For Weekly Predictions:**
- ARIMA(2, 1, 2)
- Simpler, good for medium-term forecasts

**For Monthly Predictions:**
- ARIMA(1, 1, 1) with seasonal (1, 1, 1)[12]
- Captures monthly patterns

### Python Example:

```python
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX

# Load data
df = pd.read_csv('sales_data.csv', parse_dates=['date'])
df.set_index('date', inplace=True)

# Fit ARIMA model
model = SARIMAX(
    df['revenue'],
    order=(1, 1, 1),              # (p, d, q)
    seasonal_order=(7, 1, 1, 7),  # (P, D, Q, s) - weekly
    enforce_stationarity=False,
    enforce_invertibility=False
)

results = model.fit()
print(results.summary())

# Forecast next 30 days
forecast = results.forecast(steps=30)
print(forecast)
```

## Troubleshooting

### If you get "sequence out of sync" errors:
Run these after data generation:

```sql
SELECT setval(pg_get_serial_sequence('order', 'order_id'), 
              (SELECT MAX(order_id) FROM "order"), true);
SELECT setval(pg_get_serial_sequence('cart', 'cart_id'), 
              (SELECT MAX(cart_id) FROM cart), true);
SELECT setval(pg_get_serial_sequence('order_item', 'order_item_id'), 
              (SELECT MAX(order_item_id) FROM order_item), true);
```

### Check for data quality:
```sql
-- Missing dates?
SELECT COUNT(DISTINCT DATE(date)) as unique_days
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days';
-- Should be ~365

-- Status distribution correct?
SELECT status, COUNT(*), 
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as pct
FROM "order"
GROUP BY status;
-- Should be ~70% PAID, ~20% PENDING, ~10% CANCELLED
```

## Notes

- The script automatically updates sequences to prevent conflicts
- All timestamps include random times throughout the day
- Prices have ±10% variation for realism
- 20% of orders include discounts
- VAT automatically calculated at 7%
