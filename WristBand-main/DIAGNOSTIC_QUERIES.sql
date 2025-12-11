-- ============================================================================
-- DIAGNOSTIC QUERIES - Run these to troubleshoot
-- ============================================================================

-- 1. Check if the user exists in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'demo.user@example.com';

-- COPY THE USER ID FROM ABOVE RESULT AND USE IT BELOW

-- ============================================================================

-- 2. Check if wristband_data table has the correct columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wristband_data'
ORDER BY ordinal_position;

-- ============================================================================

-- 3. Check if Row Level Security is enabled (this might block inserts)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'wristband_data';

-- ============================================================================

-- 4. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'wristband_data';

-- ============================================================================

-- 5. Count all records in wristband_data (admin view, bypassing RLS)
-- This will show if ANY data exists
SELECT COUNT(*) as total_records FROM wristband_data;

-- ============================================================================

-- 6. Check records for specific user (replace with your user ID from step 1)
SELECT COUNT(*) as user_records 
FROM wristband_data 
WHERE user_id = 'YOUR-USER-ID-HERE';

-- ============================================================================

-- 7. View sample data (replace with your user ID from step 1)
SELECT * 
FROM wristband_data 
WHERE user_id = 'YOUR-USER-ID-HERE'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- SOLUTIONS BASED ON DIAGNOSTIC RESULTS
-- ============================================================================

-- IF RLS is enabled but you can't insert:
-- The SQL Editor might not have permission. You need to either:
-- A) Disable RLS temporarily to insert test data
-- B) Use the service role key (not recommended for manual inserts)
-- C) Insert via the app's API endpoint

-- TEMPORARY SOLUTION: Disable RLS, insert data, re-enable RLS
-- Run this to disable RLS:
ALTER TABLE wristband_data DISABLE ROW LEVEL SECURITY;

-- Then run your INSERT statements from RAW_SQL_SEED.sql

-- Then re-enable RLS:
ALTER TABLE wristband_data ENABLE ROW LEVEL SECURITY;

-- ============================================================================
