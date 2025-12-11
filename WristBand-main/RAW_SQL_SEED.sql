-- ============================================================================
-- RAW SQL QUERIES - Run directly in Supabase SQL Editor
-- ============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" or "Invite User"
-- 3. Email: demo.user@example.com
-- 4. Password: DemoPass123!
-- 5. Toggle "Auto Confirm User" to ON
-- 6. Click "Create User"
-- 7. COPY THE USER ID (UUID) that appears in the user list
-- 8. Replace 'YOUR-USER-ID-HERE' below with that UUID
-- 9. Run this entire SQL file in SQL Editor
--
-- ============================================================================

-- STEP 1: Replace 'YOUR-USER-ID-HERE' with your actual user UUID
-- Example UUID format: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

-- Insert 20 wristband data readings
INSERT INTO wristband_data (user_id, device_id, hr, temp, spo2, bp_sys, bp_dia, created_at)
VALUES 
  ('YOUR-USER-ID-HERE', 'device-001', 72, 36.6, 98, 120, 80, now() - interval '120 minutes'),
  ('YOUR-USER-ID-HERE', 'device-001', 75, 36.7, 97, 122, 82, now() - interval '110 minutes'),
  ('YOUR-USER-ID-HERE', 'device-001', 70, 36.5, 99, 118, 78, now() - interval '100 minutes'),
  ('YOUR-USER-ID-HERE', 'device-002', 80, 36.9, 96, 125, 85, now() - interval '90 minutes'),
  ('YOUR-USER-ID-HERE', 'device-002', 78, 36.8, 97, 124, 84, now() - interval '80 minutes'),
  ('YOUR-USER-ID-HERE', 'device-002', 76, 36.7, 97, 123, 83, now() - interval '70 minutes'),
  ('YOUR-USER-ID-HERE', 'device-003', 65, 36.4, 99, 115, 75, now() - interval '60 minutes'),
  ('YOUR-USER-ID-HERE', 'device-003', 67, 36.5, 99, 116, 76, now() - interval '50 minutes'),
  ('YOUR-USER-ID-HERE', 'device-003', 69, 36.6, 98, 117, 77, now() - interval '40 minutes'),
  ('YOUR-USER-ID-HERE', 'device-001', 74, 36.7, 97, 121, 81, now() - interval '30 minutes'),
  ('YOUR-USER-ID-HERE', 'device-004', 90, 37.1, 95, 130, 88, now() - interval '28 minutes'),
  ('YOUR-USER-ID-HERE', 'device-004', 88, 37.0, 95, 129, 87, now() - interval '26 minutes'),
  ('YOUR-USER-ID-HERE', 'device-005', 60, 36.3, 99, 110, 70, now() - interval '24 minutes'),
  ('YOUR-USER-ID-HERE', 'device-005', 62, 36.4, 99, 112, 72, now() - interval '22 minutes'),
  ('YOUR-USER-ID-HERE', 'device-001', 73, 36.6, 98, 120, 80, now() - interval '20 minutes'),
  ('YOUR-USER-ID-HERE', 'device-002', 77, 36.8, 97, 123, 83, now() - interval '18 minutes'),
  ('YOUR-USER-ID-HERE', 'device-003', 68, 36.5, 98, 116, 76, now() - interval '15 minutes'),
  ('YOUR-USER-ID-HERE', 'device-004', 85, 36.9, 96, 128, 86, now() - interval '10 minutes'),
  ('YOUR-USER-ID-HERE', 'device-005', 63, 36.4, 99, 113, 73, now() - interval '5 minutes'),
  ('YOUR-USER-ID-HERE', 'device-001', 71, 36.6, 98, 119, 79, now() - interval '2 minutes');

-- ============================================================================
-- VERIFICATION: Check if data was inserted correctly
-- ============================================================================

-- Count rows for your user (should show 20)
SELECT COUNT(*) as total_records 
FROM wristband_data 
WHERE user_id = 'YOUR-USER-ID-HERE';

-- View all your data
SELECT device_id, hr, temp, spo2, bp_sys, bp_dia, created_at
FROM wristband_data 
WHERE user_id = 'YOUR-USER-ID-HERE'
ORDER BY created_at DESC;

-- ============================================================================
-- DEMO CREDENTIALS
-- ============================================================================
-- Email: demo.user@example.com
-- Password: DemoPass123!
--
-- After running this SQL:
-- 1. Start your app: npm run dev
-- 2. Visit: http://localhost:3000
-- 3. Login with the credentials above
-- 4. You should see 5 devices with data in your dashboard!
-- ============================================================================
