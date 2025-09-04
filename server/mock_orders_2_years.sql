-- MOCK DATA: Last 1 Year (Sep 3, 2024 - Sep 3, 2025)
-- Creates 10,980 orders (366 days × 30 orders per day)

INSERT INTO "order" (date, total_amount, total_price, employee_id, customer_id, status, vat, cost_id, revenue_source_id)
SELECT 
    date_series + (random() * interval '12 hours' + interval '8 hours') as date,
    
    CASE 
        WHEN (500 + 
              300 * SIN(2 * PI() * EXTRACT(DOY FROM date_series) / 365.0 + PI()/2) +
              100 * SIN(2 * PI() * EXTRACT(DAY FROM date_series) / 30.0) +
              80 * COS(2 * PI() * EXTRACT(DOW FROM date_series) / 7.0) +
              (random() - 0.5) * 200 +
              CASE WHEN random() < 0.03 THEN 300 ELSE 0 END) < 50 
        THEN 50
        ELSE ROUND(500 + 
                   300 * SIN(2 * PI() * EXTRACT(DOY FROM date_series) / 365.0 + PI()/2) +
                   100 * SIN(2 * PI() * EXTRACT(DAY FROM date_series) / 30.0) +
                   80 * COS(2 * PI() * EXTRACT(DOW FROM date_series) / 7.0) +
                   (random() - 0.5) * 200 +
                   CASE WHEN random() < 0.03 THEN 300 ELSE 0 END)
    END::INT as total_amount,
    
    NULL as total_price,
    4 as employee_id,
    1 as customer_id,
    'PAID' as status,
    
    CASE 
        WHEN ((500 + 
               300 * SIN(2 * PI() * EXTRACT(DOY FROM date_series) / 365.0 + PI()/2) +
               100 * SIN(2 * PI() * EXTRACT(DAY FROM date_series) / 30.0) +
               80 * COS(2 * PI() * EXTRACT(DOW FROM date_series) / 7.0) +
               (random() - 0.5) * 200 +
               CASE WHEN random() < 0.03 THEN 300 ELSE 0 END) * 0.07) < 4 
        THEN 4
        ELSE ROUND((500 + 
                    300 * SIN(2 * PI() * EXTRACT(DOY FROM date_series) / 365.0 + PI()/2) +
                    100 * SIN(2 * PI() * EXTRACT(DAY FROM date_series) / 30.0) +
                    80 * COS(2 * PI() * EXTRACT(DOW FROM date_series) / 7.0) +
                    (random() - 0.5) * 200 +
                    CASE WHEN random() < 0.03 THEN 300 ELSE 0 END) * 0.07)
    END::INT as vat,
    
    NULL as cost_id,
    NULL as revenue_source_id
FROM (
    SELECT generate_series('2024-09-03'::date, '2025-09-03'::date, '1 day'::interval) as date_series
) days,
generate_series(1, 30) as order_number;

-- VERIFICATION QUERIES

-- Check total orders created
SELECT COUNT(*) as total_orders FROM "order" WHERE date >= '2024-09-03';

-- Monthly summary
SELECT 
    TO_CHAR(date, 'YYYY-MM') as month,
    COUNT(*) as orders,
    ROUND(AVG(total_amount)) as avg_amount,
    ROUND(SUM(total_amount)) as total_revenue
FROM "order" 
WHERE date >= '2024-09-03'
GROUP BY TO_CHAR(date, 'YYYY-MM')
ORDER BY month;
