-- create_demo_user_and_wristband_data.sql
--
-- SIMPLIFIED APPROACH: Create user via Supabase Dashboard UI, then seed data
--
-- ============================================================================
-- OPTION 1: Create User via Supabase Dashboard (RECOMMENDED - Easiest)
-- ============================================================================
-- 1) Go to your Supabase Dashboard → Authentication → Users
-- 2) Click "Add User" or "Invite User"
-- 3) Enter email: demo.user@example.com
-- 4) Enter password: DemoPass123!
-- 5) Toggle "Auto Confirm User" to ON
-- 6) Click "Create User"
-- 7) Copy the user's ID (UUID) from the users table
-- 8) Replace ':USER_ID' below with that UUID and run the INSERT statements
--
-- Demo credentials:
-- Email: demo.user@example.com
-- Password: DemoPass123!
--
-- ============================================================================
-- OPTION 2: Create User via SQL (Advanced)
-- ============================================================================
-- If you prefer SQL, use the new Supabase auth helpers extension:
-- First, ensure you have the necessary extensions enabled in your Supabase project.
-- Then you can manually insert into auth.users (use Dashboard method instead - it's safer)
--
-- For now, SKIP to Step 2 below after creating user via Dashboard (Option 1)
-- ============================================================================

-- ============================================================================
-- Step 1: Get Your User ID
-- ============================================================================
-- After creating the user via Dashboard (see instructions above):
-- 1. Go to Authentication → Users in Supabase Dashboard
-- 2. Find the user you just created (demo.user@example.com)
-- 3. Click on the user to see their details
-- 4. Copy their ID (UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
-- 5. Replace EVERY occurrence of ':USER_ID' below with that UUID (keep the quotes!)
--
-- Example: If your user ID is f47ac10b-58cc-4372-a567-0e02b2c3d479
-- Change: VALUES (':USER_ID', 'device-001', ...)
-- To:     VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'device-001', ...)
--
-- ============================================================================
-- Step 2: Run These INSERT Statements (After replacing :USER_ID)
-- ============================================================================

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-001', 72, 36.6, 98, 120, 80, now() - interval '120 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-001', 75, 36.7, 97, 122, 82, now() - interval '110 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-001', 70, 36.5, 99, 118, 78, now() - interval '100 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-002', 80, 36.9, 96, 125, 85, now() - interval '90 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-002', 78, 36.8, 97, 124, 84, now() - interval '80 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-002', 76, 36.7, 97, 123, 83, now() - interval '70 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-003', 65, 36.4, 99, 115, 75, now() - interval '60 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-003', 67, 36.5, 99, 116, 76, now() - interval '50 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-003', 69, 36.6, 98, 117, 77, now() - interval '40 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-001', 74, 36.7, 97, 121, 81, now() - interval '30 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-004', 90, 37.1, 95, 130, 88, now() - interval '28 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-004', 88, 37.0, 95, 129, 87, now() - interval '26 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-005', 60, 36.3, 99, 110, 70, now() - interval '24 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-005', 62, 36.4, 99, 112, 72, now() - interval '22 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-001', 73, 36.6, 98, 120, 80, now() - interval '20 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-002', 77, 36.8, 97, 123, 83, now() - interval '18 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-003', 68, 36.5, 98, 116, 76, now() - interval '15 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-004', 85, 36.9, 96, 128, 86, now() - interval '10 minutes');

INSERT INTO wristband_data (user_id, device_id, heart_rate, body_temp, spo2, systolic, diastolic, created_at)
VALUES (':USER_ID', 'device-005', 63, 36.4, 99, 113, 73, now() - interval '5 minutes');

-- End of seed file
-- If your table has different column names or extra required columns, adapt the INSERT statements accordingly.
