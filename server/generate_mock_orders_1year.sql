-- ============================================================================
-- MOCK ORDER DATA GENERATOR - ONE YEAR HISTORICAL DATA
-- ============================================================================
-- Generates 10-20 orders per day for the last year (365 days)
-- Employee ID: Fixed at 7
-- Customer IDs: Random between 2-7
-- Product IDs: 1, 2, 6, 8, 12, 13, 14, 15, 16, 17 (from your image)
-- Status Distribution: 70% PAID, 20% PENDING, 10% CANCELLED
-- ARIMA-Optimized: Includes seasonal patterns, weekly cycles, and growth trends
-- ============================================================================

DO $$
DECLARE
    v_date DATE;
    v_end_date DATE := CURRENT_DATE;
    v_start_date DATE := CURRENT_DATE - INTERVAL '365 days';
    v_orders_per_day INT;
    v_order_id INT;
    v_customer_id INT;
    v_product_id INT;
    v_quantity INT;
    v_unit_price FLOAT;
    v_total_amount INT;
    v_total_price FLOAT;
    v_status VARCHAR(50);
    v_status_rand FLOAT;
    v_order_items_count INT;
    v_item_loop INT;
    v_discount_amount FLOAT;
    v_discount_type VARCHAR(50);
    v_points_used INT;
    v_order_item_id INT;
    v_cart_id INT;
    
    -- ARIMA optimization variables
    v_day_of_week INT;
    v_month INT;
    v_days_from_start INT;
    v_seasonal_multiplier FLOAT;
    v_trend_multiplier FLOAT;
    v_weekend_multiplier FLOAT;
    
    -- Product IDs and their base prices (adjust these to match your actual prices)
    product_ids INT[] := ARRAY[1, 2, 6, 8, 12, 13, 14, 15, 16, 17];
    product_prices FLOAT[] := ARRAY[55.0, 120.0, 85.0, 95.0, 150.0, 45.0, 200.0, 75.0, 110.0, 180.0];
    
BEGIN
    -- Get the next available IDs to avoid conflicts
    SELECT COALESCE(MAX(order_id), 0) + 1 INTO v_order_id FROM "order";
    SELECT COALESCE(MAX(order_item_id), 0) + 1 INTO v_order_item_id FROM order_item;
    SELECT COALESCE(MAX(cart_id), 0) + 1 INTO v_cart_id FROM cart;
    
    RAISE NOTICE 'Starting order generation...';
    RAISE NOTICE 'Date range: % to %', v_start_date, v_end_date;
    RAISE NOTICE 'Starting order_id: %', v_order_id;
    
    -- Loop through each day in the past year
    v_date := v_start_date;
    WHILE v_date <= v_end_date LOOP
        
        -- Calculate ARIMA-friendly patterns
        v_day_of_week := EXTRACT(DOW FROM v_date); -- 0=Sunday, 6=Saturday
        v_month := EXTRACT(MONTH FROM v_date);
        v_days_from_start := v_date - v_start_date;
        
        -- Seasonal multiplier (flu season Nov-Feb has more sales)
        v_seasonal_multiplier := CASE
            WHEN v_month IN (11, 12, 1, 2) THEN 1.3  -- Winter/flu season
            WHEN v_month IN (3, 4, 5) THEN 1.1       -- Spring
            WHEN v_month IN (6, 7, 8) THEN 0.9       -- Summer (lower sales)
            ELSE 1.0                                  -- Fall
        END;
        
        -- Weekend multiplier (lower sales on weekends)
        v_weekend_multiplier := CASE
            WHEN v_day_of_week IN (0, 6) THEN 0.7   -- Weekend
            WHEN v_day_of_week = 5 THEN 1.1          -- Friday (slightly higher)
            ELSE 1.0
        END;
        
        -- Growth trend (5% annual growth, linear)
        v_trend_multiplier := 1.0 + (v_days_from_start::FLOAT / 365.0 * 0.05);
        
        -- Calculate orders per day with patterns (base 10-20, modified by multipliers)
        v_orders_per_day := GREATEST(
            5,
            LEAST(
                30,
                FLOOR(
                    (10 + random() * 11) * 
                    v_seasonal_multiplier * 
                    v_weekend_multiplier * 
                    v_trend_multiplier
                )::INT
            )
        );
        
        -- Create orders for this day
        FOR i IN 1..v_orders_per_day LOOP
            
            -- Random customer (2-7)
            v_customer_id := 2 + floor(random() * 6)::INT;
            
            -- Random number of items in order (1-5)
            v_order_items_count := 1 + floor(random() * 5)::INT;
            
            -- Calculate status based on distribution
            v_status_rand := random();
            IF v_status_rand < 0.70 THEN
                v_status := 'PAID';
            ELSIF v_status_rand < 0.90 THEN
                v_status := 'PENDING';
            ELSE
                v_status := 'CANCELLED';
            END IF;
            
            -- Initialize order totals
            v_total_amount := 0;
            v_total_price := 0.0;
            
            -- Random discount (20% chance of having a discount)
            IF random() < 0.2 THEN
                v_discount_amount := 10.0 + (random() * 40.0); -- 10-50 THB
                v_discount_type := CASE 
                    WHEN random() < 0.5 THEN 'percentage'
                    ELSE 'fixed'
                END;
                v_points_used := floor(random() * 100)::INT;
            ELSE
                v_discount_amount := 0.0;
                v_discount_type := 'none';
                v_points_used := 0;
            END IF;
            
            -- Create the order first (without calculated totals)
            INSERT INTO "order" (
                order_id,
                employee_id,
                customer_id,
                date,
                status,
                total_amount,
                total_price,
                discount_amount,
                discount_type,
                points_used,
                vat
            ) VALUES (
                v_order_id,
                7, -- Fixed employee_id
                v_customer_id,
                v_date + (random() * INTERVAL '23 hours 59 minutes'), -- Random time during the day
                v_status,
                0, -- Will update after creating items
                0.0, -- Will update after creating items
                v_discount_amount,
                v_discount_type,
                v_points_used,
                0.0
            );
            
            -- Create order items and cart items
            FOR v_item_loop IN 1..v_order_items_count LOOP
                
                -- Random product from the list
                v_product_id := product_ids[1 + floor(random() * array_length(product_ids, 1))::INT];
                
                -- Get the price for this product
                FOR idx IN 1..array_length(product_ids, 1) LOOP
                    IF product_ids[idx] = v_product_id THEN
                        v_unit_price := product_prices[idx];
                        EXIT;
                    END IF;
                END LOOP;
                
                -- Random quantity (1-10)
                v_quantity := 1 + floor(random() * 10)::INT;
                
                -- Add price variation (+/- 10%)
                v_unit_price := v_unit_price * (0.9 + (random() * 0.2));
                
                -- Calculate totals
                v_total_amount := v_total_amount + v_quantity;
                v_total_price := v_total_price + (v_quantity * v_unit_price);
                
                -- Insert order_item
                INSERT INTO order_item (
                    order_item_id,
                    order_id,
                    product_id,
                    quantity
                ) VALUES (
                    v_order_item_id,
                    v_order_id,
                    v_product_id,
                    v_quantity
                );
                
                v_order_item_id := v_order_item_id + 1;
                
                -- Insert cart item
                INSERT INTO cart (
                    cart_id,
                    order_id,
                    product_id,
                    amount,
                    unit_price
                ) VALUES (
                    v_cart_id,
                    v_order_id,
                    v_product_id,
                    v_quantity,
                    v_unit_price
                );
                
                v_cart_id := v_cart_id + 1;
                
            END LOOP;
            
            -- Apply discount if applicable
            IF v_discount_type = 'percentage' THEN
                v_total_price := v_total_price * (1 - (v_discount_amount / 100));
            ELSIF v_discount_type = 'fixed' THEN
                v_total_price := GREATEST(v_total_price - v_discount_amount, 0);
            END IF;
            
            -- Update order with calculated totals
            UPDATE "order"
            SET 
                total_amount = v_total_amount,
                total_price = v_total_price,
                vat = v_total_price * 0.07
            WHERE order_id = v_order_id;
            
            v_order_id := v_order_id + 1;
            
        END LOOP;
        
        -- Progress indicator every 30 days
        IF EXTRACT(DAY FROM v_date) = 1 THEN
            RAISE NOTICE 'Processed up to: %', v_date;
        END IF;
        
        -- Move to next day
        v_date := v_date + INTERVAL '1 day';
        
    END LOOP;
    
    RAISE NOTICE 'Order generation completed!';
    RAISE NOTICE 'Total orders created: %', v_order_id - (SELECT COALESCE(MAX(order_id), 0) + 1 FROM "order" WHERE order_id < v_order_id - 1000);
    
    -- Update sequences to avoid conflicts
    PERFORM setval(
        pg_get_serial_sequence('order', 'order_id'),
        (SELECT MAX(order_id) FROM "order"),
        true
    );
    
    PERFORM setval(
        pg_get_serial_sequence('order_item', 'order_item_id'),
        (SELECT MAX(order_item_id) FROM order_item),
        true
    );
    
    PERFORM setval(
        pg_get_serial_sequence('cart', 'cart_id'),
        (SELECT MAX(cart_id) FROM cart),
        true
    );
    
    RAISE NOTICE 'Sequences updated successfully!';
    RAISE NOTICE '✅ Mock data generation complete!';
    
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check order count by date range
SELECT 
    DATE_TRUNC('month', date) as month,
    COUNT(*) as order_count,
    COUNT(*) FILTER (WHERE status = 'PAID') as paid_count,
    COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY DATE_TRUNC('month', date)
ORDER BY month;

-- Check status distribution
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY status
ORDER BY count DESC;

-- Check customer distribution
SELECT 
    customer_id,
    COUNT(*) as order_count
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '365 days'
    AND customer_id BETWEEN 2 AND 7
GROUP BY customer_id
ORDER BY customer_id;

-- Check product sales
SELECT 
    oi.product_id,
    p.product_name,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity) as total_quantity
FROM order_item oi
JOIN product p ON p.product_id = oi.product_id
JOIN "order" o ON o.order_id = oi.order_id
WHERE o.date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY oi.product_id, p.product_name
ORDER BY total_quantity DESC;

-- Check daily order count (last 30 days)
SELECT 
    DATE(date) as order_date,
    COUNT(*) as orders_per_day
FROM "order"
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(date)
ORDER BY order_date DESC
LIMIT 30;
