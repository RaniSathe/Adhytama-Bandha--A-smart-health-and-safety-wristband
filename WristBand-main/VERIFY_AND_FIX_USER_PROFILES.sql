-- ============================================
-- VERIFY AND FIX USER PROFILES
-- Run these queries to check and fix user profiles
-- ============================================

-- STEP 1: Check if user_profiles table exists
-- ============================================
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- If no results, you need to run CREATE_USER_PROFILE_TABLE.sql first!


-- STEP 2: Check if trigger exists
-- ============================================
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Should show: on_auth_user_created | INSERT | users | EXECUTE FUNCTION handle_new_user()


-- STEP 3: Check all users vs profiles
-- ============================================
SELECT 
  u.id as user_id,
  u.email as user_email,
  u.created_at as user_created,
  p.id as profile_id,
  p.full_name,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    ELSE '✅ HAS PROFILE'
  END as status
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
ORDER BY u.created_at DESC;


-- STEP 4: Find users WITHOUT profiles
-- ============================================
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'full_name' as full_name_from_metadata
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL;


-- STEP 5: Auto-create missing profiles for existing users
-- ============================================
-- This will create profiles for users who don't have one yet
INSERT INTO public.user_profiles (id, full_name, avatar_url)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name', 
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)  -- Use email username as fallback
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url', 
    u.raw_user_meta_data->>'picture',
    ''
  )
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Run the above and check how many rows were inserted
-- Should show: "INSERT 0 X" where X = number of profiles created


-- STEP 6: Verify all users now have profiles
-- ============================================
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id;

-- Should show: users_without_profiles = 0


-- STEP 7: View all profiles
-- ============================================
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.phone,
  p.created_at,
  p.updated_at,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM public.user_profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;


-- ============================================
-- MANUAL PROFILE CREATION (if needed)
-- ============================================

-- If you need to manually create a profile for a specific user:

-- First, get the user's UUID:
-- SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Then insert profile:
-- INSERT INTO public.user_profiles (id, full_name)
-- VALUES (
--   'PASTE-USER-UUID-HERE',
--   'User Full Name'
-- );


-- ============================================
-- TEST THE TRIGGER
-- ============================================

-- To test if the trigger works for NEW users:
-- 1. Sign up a new test user in your app
-- 2. Run this query immediately after:

SELECT 
  u.id,
  u.email,
  u.created_at as signed_up_at,
  p.id as profile_exists,
  p.full_name,
  p.created_at as profile_created_at
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 1;

-- The newest user should have profile_exists = their UUID
-- If profile_exists is NULL, the trigger is not working!


-- ============================================
-- RE-CREATE TRIGGER (if it's not working)
-- ============================================

-- If trigger doesn't exist or isn't working, run this:

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Re-create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$;

-- Re-create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- FINAL VERIFICATION
-- ============================================

-- Check everything is working:
SELECT 
  'Trigger exists' as check_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ YES' 
    ELSE '❌ NO - Run trigger creation above!' 
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'

UNION ALL

SELECT 
  'All users have profiles' as check_name,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ YES' 
    ELSE '❌ NO - ' || COUNT(*) || ' users missing profiles. Run STEP 5 above!' 
  END as status
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL;


-- ============================================
-- DONE! ✅
-- ============================================
-- After running these queries:
-- 1. All existing users should have profiles
-- 2. Trigger should be working for new signups
-- 3. Every new user will automatically get a profile
-- ============================================
