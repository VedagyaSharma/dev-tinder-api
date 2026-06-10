-- Production-ready query for user orders dashboard

-- CTE
WITH filtered_orders AS (
    SELECT 
        id AS order_id,
        user_id,
        total_amount,
        status,
        created_at
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND status IN ('completed', 'shipped', 'processing')
),
active_users AS (
    SELECT 
        id AS user_id,
        name AS user_name,
        email,
        created_at AS user_created_at
    FROM users
    WHERE is_active = true
    AND created_at >= CURRENT_DATE - INTERVAL '180 days'
)

-- JOINS
SELECT 
    au.user_id,
    au.user_name,
    au.email,
    au.user_created_at,
    COUNT(fo.order_id) AS total_orders,
    SUM(fo.total_amount) AS total_revenue,
    MAX(fo.created_at) AS last_order_date
FROM active_users au
LEFT JOIN filtered_orders fo ON au.user_id = fo.user_id
GROUP BY au.user_id, au.user_name, au.email, au.user_created_at
HAVING COUNT(fo.order_id) > 0
ORDER BY total_revenue DESC
LIMIT 1000;


-- Anti-Join Pattern (Find Missing Records)
-- Users who have NOT placed any orders
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;

-- Alternative using NOT EXISTS (often faster):
SELECT 
    u.id AS user_id,
    u.name AS user_name
FROM users u
WHERE NOT EXISTS (
    SELECT 1 
    FROM orders o 
    WHERE o.user_id = u.id
);

-- ✅ Use NOT EXISTS instead of NOT IN when columns can be NULL.

-- Performance Optimization Checklist Indexes (Critical)
-- Create indexes on join columns
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_users_created_at ON users(created_at);
-- Missing indexes on join columns = major performance bottleneck

-- Query Analysis
-- Check execution plan (PostgreSQL)
EXPLAIN ANALYZE
SELECT ... FROM ... JOIN ...;

-- Check execution plan (MySQL)
EXPLAIN SELECT ... FROM ... JOIN ...;

-- Check execution plan (SQL Server)
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
SELECT ... FROM ... JOIN ...;