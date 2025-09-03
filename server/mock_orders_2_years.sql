-- ARIMA-OPTIMIZED 2-YEAR MOCK DATA (September 4, 2023 - September 3, 2025)
-- Generates ~14,600 orders (730 days * 20 orders per day)
-- Perfect for ARIMA models: Clear trend + seasonality + controlled noise

INSERT INTO "order" (date, total_amount, total_price, employee_id, customer_id, status, vat, cost_id, revenue_source_id)
SELECT 
    -- Random business hours timestamp
    date_series + (random() * interval '12 hours' + interval '8 hours') as date,
    
    -- ARIMA-perfect amount calculation with multiple components:
    GREATEST(300, ROUND(
        -- 1. BASE TREND (linear growth over time)
        2000 + (date_series - '2023-09-04'::date) * 1.2 +
        
        -- 2. STRONG SEASONAL COMPONENT (yearly pattern)
        800 * SIN(2 * PI() * EXTRACT(DOY FROM date_series) / 365.0 + PI()/2) +
        
        -- 3. MONTHLY VARIATION (end-of-month effects)
        200 * SIN(2 * PI() * EXTRACT(DAY FROM date_series) / 30.0) +
        
        -- 4. WEEKLY PATTERN (business vs weekend)
        150 * COS(2 * PI() * EXTRACT(DOW FROM date_series) / 7.0) +
        
        -- 5. WHITE NOISE (random variation)
        (random() - 0.5) * 300 +
        
        -- 6. OCCASIONAL SPIKES (special events, 5% of days)
        CASE WHEN random() < 0.05 THEN 500 ELSE 0 END
    ))::INT as total_amount,
    
    NULL as total_price,
    4 as employee_id,
    1 as customer_id,
    'PAID' as status,
    
    -- VAT = 7% of total_amount
    GREATEST(21, ROUND(
        (2000 + (date_series - '2023-09-04'::date) * 1.2 +
         800 * SIN(2 * PI() * EXTRACT(DOY FROM date_series) / 365.0 + PI()/2) +
         200 * SIN(2 * PI() * EXTRACT(DAY FROM date_series) / 30.0) +
         150 * COS(2 * PI() * EXTRACT(DOW FROM date_series) / 7.0) +
         (random() - 0.5) * 300 +
         CASE WHEN random() < 0.05 THEN 500 ELSE 0 END) * 0.07
    )) as vat,
    
    NULL as cost_id,
    NULL as revenue_source_id
FROM (
    -- Generate all dates from Sep 4, 2023 to Sep 3, 2025
    SELECT generate_series('2023-09-04'::date, '2025-09-03'::date, '1 day'::interval) as date_series
) days,
-- 20 orders per day for good daily volume
generate_series(1, 20) as order_number;

-- VERIFICATION & ANALYSIS QUERIES FOR ARIMA VALIDATION

-- 1. Total orders confirmation
SELECT 
    COUNT(*) as total_orders,
    MIN(date)::date as start_date,
    MAX(date)::date as end_date,
    ROUND(COUNT(*)::numeric / (MAX(date)::date - MIN(date)::date + 1), 1) as avg_orders_per_day
FROM "order" 
WHERE date >= '2023-09-04';

-- 2. Monthly aggregation (perfect for ARIMA time series)
SELECT 
    DATE_TRUNC('month', date)::date as month,
    TO_CHAR(date, 'YYYY-MM') as period,
    COUNT(*) as order_count,
    AVG(total_amount) as avg_amount,
    SUM(total_amount) as monthly_revenue,
    ROUND(STDDEV(total_amount), 2) as amount_volatility
FROM "order" 
WHERE date >= '2023-09-04' AND status = 'PAID'
GROUP BY DATE_TRUNC('month', date), TO_CHAR(date, 'YYYY-MM')
ORDER BY month;

-- 3. Seasonal pattern verification (should show clear winter peaks)
SELECT 
    EXTRACT(MONTH FROM date) as month,
    CASE EXTRACT(MONTH FROM date)
        WHEN 1 THEN 'Jan' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar'
        WHEN 4 THEN 'Apr' WHEN 5 THEN 'May' WHEN 6 THEN 'Jun'
        WHEN 7 THEN 'Jul' WHEN 8 THEN 'Aug' WHEN 9 THEN 'Sep'
        WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dec'
    END as month_name,
    COUNT(*) as orders,
    ROUND(AVG(total_amount), 0) as avg_amount,
    ROUND(SUM(total_amount), 0) as total_revenue
FROM "order" 
WHERE date >= '2023-09-04' AND status = 'PAID'
GROUP BY EXTRACT(MONTH FROM date)
ORDER BY EXTRACT(MONTH FROM date);

-- 4. Trend analysis (should show upward trend)
SELECT 
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(QUARTER FROM date) as quarter,
    COUNT(*) as orders,
    ROUND(AVG(total_amount), 0) as avg_amount,
    ROUND(SUM(total_amount), 0) as quarterly_revenue
FROM "order" 
WHERE date >= '2023-09-04' AND status = 'PAID'
GROUP BY EXTRACT(YEAR FROM date), EXTRACT(QUARTER FROM date)
ORDER BY year, quarter;

-- 5. Weekly pattern check (should show weekend dips)
SELECT 
    CASE EXTRACT(DOW FROM date)
        WHEN 0 THEN 'Sunday' WHEN 1 THEN 'Monday' WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday' WHEN 4 THEN 'Thursday' 
        WHEN 5 THEN 'Friday' WHEN 6 THEN 'Saturday'
    END as day_of_week,
    ROUND(AVG(total_amount), 0) as avg_amount,
    COUNT(*) as order_count
FROM "order" 
WHERE date >= '2023-09-04' AND status = 'PAID'
GROUP BY EXTRACT(DOW FROM date)
ORDER BY EXTRACT(DOW FROM date);

-- 6. Recent data sample
SELECT 
    date::date as order_date,
    COUNT(*) as daily_orders,
    ROUND(AVG(total_amount), 0) as avg_amount,
    ROUND(SUM(total_amount), 0) as daily_revenue
FROM "order" 
WHERE date >= '2025-08-25' AND date <= '2025-09-03'
GROUP BY date::date
ORDER BY order_date;
