-- ============================================================================
-- ARIMA DATA EXPORT QUERIES
-- ============================================================================
-- Use these queries to export data for ARIMA forecasting model
-- The data includes seasonal patterns, trends, and proper time series format
-- ============================================================================

-- 1. Daily Sales Volume (Main ARIMA Input)
-- This is the primary dataset for ARIMA model
SELECT 
    DATE(date) as sale_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_items_sold,
    SUM(total_price) as total_revenue,
    AVG(total_price) as avg_order_value,
    EXTRACT(DOW FROM date) as day_of_week,
    EXTRACT(MONTH FROM date) as month,
    EXTRACT(YEAR FROM date) as year
FROM "order"
WHERE status = 'PAID'
    AND date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE(date)
ORDER BY sale_date ASC;

-- 2. Weekly Aggregated Sales (For Weekly ARIMA)
SELECT 
    DATE_TRUNC('week', date) as week_start,
    COUNT(*) as weekly_orders,
    SUM(total_amount) as weekly_items,
    SUM(total_price) as weekly_revenue
FROM "order"
WHERE status = 'PAID'
    AND date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE_TRUNC('week', date)
ORDER BY week_start ASC;

-- 3. Monthly Aggregated Sales (For Monthly ARIMA)
SELECT 
    DATE_TRUNC('month', date) as month_start,
    COUNT(*) as monthly_orders,
    SUM(total_amount) as monthly_items,
    SUM(total_price) as monthly_revenue
FROM "order"
WHERE status = 'PAID'
    AND date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month_start ASC;

-- 4. Product-Specific Daily Sales (For Multi-variate ARIMA)
SELECT 
    DATE(o.date) as sale_date,
    oi.product_id,
    p.product_name,
    SUM(oi.quantity) as daily_quantity,
    COUNT(DISTINCT o.order_id) as order_count,
    AVG(c.unit_price) as avg_price
FROM "order" o
JOIN order_item oi ON o.order_id = oi.order_id
JOIN product p ON p.product_id = oi.product_id
LEFT JOIN cart c ON c.order_id = o.order_id AND c.product_id = oi.product_id
WHERE o.status = 'PAID'
    AND o.date >= CURRENT_DATE - INTERVAL '365 days'
    AND oi.product_id IN (1, 2, 6, 8, 12, 13, 14, 15, 16, 17)
GROUP BY DATE(o.date), oi.product_id, p.product_name
ORDER BY sale_date ASC, oi.product_id ASC;

-- 5. Time Series with Seasonal Indicators (Enhanced ARIMA)
SELECT 
    DATE(date) as sale_date,
    SUM(total_price) as daily_revenue,
    EXTRACT(DOW FROM date) as day_of_week,
    EXTRACT(DAY FROM date) as day_of_month,
    EXTRACT(MONTH FROM date) as month,
    EXTRACT(QUARTER FROM date) as quarter,
    CASE 
        WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 1 
        ELSE 0 
    END as is_weekend,
    CASE 
        WHEN EXTRACT(MONTH FROM date) IN (11, 12, 1, 2) THEN 1 
        ELSE 0 
    END as is_flu_season,
    COUNT(*) as order_count
FROM "order"
WHERE status = 'PAID'
    AND date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE(date)
ORDER BY sale_date ASC;

-- 6. Export to CSV Format (Copy result to CSV file)
-- Use this for direct import to Python/R ARIMA models
\copy (SELECT DATE(date) as date, SUM(total_price) as revenue FROM "order" WHERE status = 'PAID' AND date >= CURRENT_DATE - INTERVAL '365 days' GROUP BY DATE(date) ORDER BY date ASC) TO '/tmp/sales_data_arima.csv' WITH CSV HEADER;

-- 7. Summary Statistics for ARIMA Model Configuration
SELECT 
    'Daily Revenue' as metric,
    COUNT(*) as observations,
    MIN(daily_rev) as min_value,
    MAX(daily_rev) as max_value,
    AVG(daily_rev) as mean_value,
    STDDEV(daily_rev) as std_dev,
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY daily_rev) as q1,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY daily_rev) as median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY daily_rev) as q3
FROM (
    SELECT SUM(total_price) as daily_rev
    FROM "order"
    WHERE status = 'PAID'
        AND date >= CURRENT_DATE - INTERVAL '365 days'
    GROUP BY DATE(date)
) subq;

-- 8. Check for Missing Dates (Important for ARIMA)
-- ARIMA requires continuous time series without gaps
SELECT 
    generate_series::date as missing_date
FROM generate_series(
    (CURRENT_DATE - INTERVAL '365 days')::date,
    CURRENT_DATE::date,
    '1 day'::interval
)
WHERE generate_series::date NOT IN (
    SELECT DISTINCT DATE(date)
    FROM "order"
    WHERE status = 'PAID'
        AND date >= CURRENT_DATE - INTERVAL '365 days'
)
ORDER BY missing_date;

-- 9. Autocorrelation Check Data (For ARIMA parameter selection)
-- Use this to determine p, d, q parameters
WITH daily_sales AS (
    SELECT 
        DATE(date) as sale_date,
        SUM(total_price) as revenue
    FROM "order"
    WHERE status = 'PAID'
        AND date >= CURRENT_DATE - INTERVAL '365 days'
    GROUP BY DATE(date)
    ORDER BY sale_date
),
lagged_sales AS (
    SELECT 
        sale_date,
        revenue,
        LAG(revenue, 1) OVER (ORDER BY sale_date) as lag_1,
        LAG(revenue, 7) OVER (ORDER BY sale_date) as lag_7,
        LAG(revenue, 30) OVER (ORDER BY sale_date) as lag_30
    FROM daily_sales
)
SELECT 
    sale_date,
    revenue,
    lag_1,
    lag_7,
    lag_30,
    revenue - lag_1 as diff_1_day,
    revenue - lag_7 as diff_7_day
FROM lagged_sales
WHERE lag_30 IS NOT NULL
ORDER BY sale_date;

-- ============================================================================
-- RECOMMENDED ARIMA CONFIGURATIONS BASED ON DATA PATTERNS
-- ============================================================================

-- For this mock data, recommended ARIMA parameters:
-- ARIMA(p=1, d=1, q=1) with seasonal component (7, 1, 1)[7] for weekly patterns
-- 
-- Explanation:
-- - p=1: Auto-regressive term (yesterday's sales affect today)
-- - d=1: Differencing order (to make series stationary)
-- - q=1: Moving average term
-- - Seasonal (7,1,1)[7]: Weekly seasonality (pharmacy busy days)
-- 
-- Python statsmodels example:
-- from statsmodels.tsa.statespace.sarimax import SARIMAX
-- model = SARIMAX(data, order=(1,1,1), seasonal_order=(7,1,1,7))
-- 
-- Alternative for monthly patterns:
-- ARIMA(2,1,2) with seasonal (1,1,1)[30] for monthly cycles
