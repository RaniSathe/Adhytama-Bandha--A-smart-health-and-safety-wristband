-- ============================================
-- QUICK DIAGNOSTIC - Run this in Supabase SQL Editor
-- ============================================

-- 1. Get the user_id for demo user
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'demo.user@example.com';

-- 2. Check what user_ids exist in wristband_data
SELECT 
  user_id,
  COUNT(*) as record_count,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM wristband_data
GROUP BY user_id;

-- 3. Check if ANY data exists
SELECT COUNT(*) as total_records FROM wristband_data;

-- ============================================
-- AFTER RUNNING ABOVE, IF USER_IDS DON'T MATCH:
-- ============================================
-- Copy the user_id from query #1 and run this:

-- UPDATE wristband_data 
-- SET user_id = 'PASTE-USER-ID-FROM-QUERY-1-HERE'
-- WHERE user_id != 'PASTE-USER-ID-FROM-QUERY-1-HERE';

-- Then check the update worked:
-- SELECT user_id, COUNT(*) FROM wristband_data GROUP BY user_id;
