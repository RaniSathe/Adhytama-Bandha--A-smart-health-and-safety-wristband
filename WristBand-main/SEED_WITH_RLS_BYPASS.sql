-- ============================================================================
-- WORKING SQL SEED - With RLS Bypass
-- ============================================================================
-- This approach temporarily disables RLS to allow inserts via SQL Editor
--
-- STEP 1: Get your user ID first
-- ============================================================================

-- Find your demo user and copy the ID
SELECT id, email 
FROM auth.users 
WHERE email = 'demo.user@example.com';

-- Copy the 'id' value and replace 'YOUR-USER-ID-HERE' below

-- ============================================================================
-- STEP 2: Temporarily disable RLS and insert data
-- ============================================================================

-- Disable RLS temporarily
ALTER TABLE wristband_data DISABLE ROW LEVEL SECURITY;

-- Insert 20 test records (replace YOUR-USER-ID-HERE with the actual UUID)
INSERT INTO wristband_data (user_id, device_id, hr, temp, spo2, bp_sys, bp_dia, created_at)
VALUES 
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-001', 72, 36.6, 98, 120, 80, now() - interval '120 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-001', 75, 36.7, 97, 122, 82, now() - interval '110 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-001', 70, 36.5, 99, 118, 78, now() - interval '100 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-002', 80, 36.9, 96, 125, 85, now() - interval '90 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-002', 78, 36.8, 97, 124, 84, now() - interval '80 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-002', 76, 36.7, 97, 123, 83, now() - interval '70 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-003', 65, 36.4, 99, 115, 75, now() - interval '60 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-003', 67, 36.5, 99, 116, 76, now() - interval '50 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-003', 69, 36.6, 98, 117, 77, now() - interval '40 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-001', 74, 36.7, 97, 121, 81, now() - interval '30 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-004', 90, 37.1, 95, 130, 88, now() - interval '28 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-004', 88, 37.0, 95, 129, 87, now() - interval '26 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-005', 60, 36.3, 99, 110, 70, now() - interval '24 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-005', 62, 36.4, 99, 112, 72, now() - interval '22 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-001', 73, 36.6, 98, 120, 80, now() - interval '20 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-002', 77, 36.8, 97, 123, 83, now() - interval '18 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-003', 68, 36.5, 98, 116, 76, now() - interval '15 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-004', 85, 36.9, 96, 128, 86, now() - interval '10 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-005', 63, 36.4, 99, 113, 73, now() - interval '5 minutes'),
  ('4495abd3-c751-4db6-b618-468f711266b8', 'device-001', 71, 36.6, 98, 119, 79, now() - interval '2 minutes');

-- Re-enable RLS for security
ALTER TABLE wristband_data ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Verify the data was inserted
-- ============================================================================

-- Count records (should show 20)
SELECT COUNT(*) as total_records 
FROM wristband_data 
WHERE user_id = 'YOUR-USER-ID-HERE';

-- View the data
SELECT device_id, hr, temp, spo2, bp_sys, bp_dia, created_at
FROM wristband_data 
WHERE user_id = 'YOUR-USER-ID-HERE'
ORDER BY created_at DESC;

-- ============================================================================
-- ALL DONE!
-- ============================================================================
-- Now login to your app:
--   Email: demo.user@example.com
--   Password: DemoPass123!
--
-- You should see 5 devices with data in the dashboard!
-- ============================================================================
