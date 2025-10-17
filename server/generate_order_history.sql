-- Mock Order Data Generator for Last Year
-- Generates 1-5 orders per day for the last 365 days
-- Employee ID: 4 (fixed)
-- Customer ID: 1-3 (random)
-- Status: Mix of PENDING and COMPLETED
-- Automatically uses existing product IDs from database

DO $$
DECLARE
    v_date DATE;
    v_end_date DATE := CURRENT_DATE;
    v_start_date DATE := CURRENT_DATE - INTERVAL '365 days';
    v_orders_per_day INT;
    v_order_count INT;
    v_customer_id INT;
    v_total_price FLOAT;
    v_total_amount INT;
    v_vat FLOAT;
    v_order_id INT;
    v_product_count INT;
    v_product_id INT;
    v_quantity INT;
    v_status TEXT;
    v_product_ids INT[];
    v_product_prices FLOAT[];
    v_random_index INT;
    v_item_price FLOAT;
BEGIN
    -- Use actual product IDs from your database (12-21)
    v_product_ids := ARRAY[12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    
    -- Realistic prices for pharmacy products (50-300 THB range)
    v_product_prices := ARRAY[
        85.0,   -- product_id 12 (M01AB Tablet)
        120.0,  -- product_id 13 (M01AB Capsule)
        95.0,   -- product_id 14 (M01AE Tablet)
        150.0,  -- product_id 15 (N02BA Tablet)
        180.0,  -- product_id 16 (N02BE/B Pack)
        200.0,  -- product_id 17 (N05B Pack)
        250.0,  -- product_id 18 (N05C Pack)
        75.0,   -- product_id 19 (Tablet Pack)
        110.0,  -- product_id 20 (M01AB Capsule)
        65.0    -- product_id 21 (Tablet Capsule)
    ];
    
    RAISE NOTICE 'Using % products (IDs: 12-21) from database', array_length(v_product_ids, 1);
    
    -- Loop through each day in the last year
    v_date := v_start_date;
    
    WHILE v_date <= v_end_date LOOP
        -- Random number of orders per day (1-5)
        v_orders_per_day := floor(random() * 5 + 1)::INT;
        
        -- Create orders for this day
        FOR v_order_count IN 1..v_orders_per_day LOOP
            -- Random customer (1-3)
            v_customer_id := floor(random() * 3 + 1)::INT;
            
            -- Random number of products in this order (1-4)
            v_product_count := floor(random() * 4 + 1)::INT;
            
            -- Calculate total price
            v_total_price := 0;
            
            -- Random status (80% COMPLETED, 20% PENDING)
            IF random() < 0.8 THEN
                v_status := 'COMPLETED';
            ELSE
                v_status := 'PENDING';
            END IF;
            
            -- Calculate order total by summing random products
            FOR i IN 1..v_product_count LOOP
                v_quantity := floor(random() * 3 + 1)::INT; -- 1-3 items per product
                v_random_index := floor(random() * array_length(v_product_prices, 1) + 1)::INT;
                v_item_price := v_product_prices[v_random_index];
                v_total_price := v_total_price + (v_item_price * v_quantity);
            END LOOP;
            
            -- Calculate VAT (7%)
            v_vat := ROUND((v_total_price * 0.07)::numeric, 2)::FLOAT;
            
            -- Total amount includes VAT
            v_total_amount := ROUND(v_total_price + v_vat);
            v_total_price := ROUND(v_total_price::numeric, 2)::FLOAT;
            
            -- Insert order with random time during the day
            INSERT INTO "order" (
                date,
                total_amount,
                total_price,
                vat,
                employee_id,
                customer_id,
                status,
                cost_id,
                revenue_source_id
            ) VALUES (
                v_date + (random() * INTERVAL '14 hours') + INTERVAL '8 hours', -- Random time between 8 AM - 10 PM
                v_total_amount,
                v_total_price,
                v_vat,
                4, -- Fixed employee_id
                v_customer_id,
                v_status,
                NULL,
                NULL -- Set to NULL if revenue_source doesn't exist
            ) RETURNING order_id INTO v_order_id;
            
            -- Insert order_items for this order
            FOR i IN 1..v_product_count LOOP
                -- Select random product from actual database products
                v_random_index := floor(random() * array_length(v_product_ids, 1) + 1)::INT;
                v_product_id := v_product_ids[v_random_index];
                v_quantity := floor(random() * 3 + 1)::INT; -- 1-3 items
                
                -- Insert order item
                INSERT INTO order_item (
                    order_id,
                    product_id,
                    quantity
                ) VALUES (
                    v_order_id,
                    v_product_id,
                    v_quantity
                );
            END LOOP;
            
        END LOOP;
        
        -- Move to next day
        v_date := v_date + INTERVAL '1 day';
    END LOOP;
    
    RAISE NOTICE 'Successfully generated orders for % days', (v_end_date - v_start_date);
END $$;

-- Verify the results
SELECT 
    DATE(date) as order_date,
    COUNT(*) as orders_count,
    SUM(total_amount) as daily_revenue
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE(date)
ORDER BY order_date DESC
LIMIT 30;

-- Summary statistics
SELECT 
    COUNT(*) as total_orders,
    COUNT(DISTINCT customer_id) as unique_customers,
    COUNT(DISTINCT DATE(date)) as days_with_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount)::numeric, 2) as avg_order_value,
    MIN(DATE(date)) as first_order,
    MAX(DATE(date)) as last_order
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days';
