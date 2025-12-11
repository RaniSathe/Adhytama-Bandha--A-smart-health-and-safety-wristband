-- ============================================
-- ADD COMPREHENSIVE PROFILE FIELDS TO USER_PROFILES
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS height NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS existing_diseases TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS family_history TEXT,
ADD COLUMN IF NOT EXISTS smoking TEXT DEFAULT 'no',
ADD COLUMN IF NOT EXISTS alcohol TEXT DEFAULT 'no',
ADD COLUMN IF NOT EXISTS diet TEXT,
ADD COLUMN IF NOT EXISTS exercise TEXT,
ADD COLUMN IF NOT EXISTS sleep_hours NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Add comment to describe the table
COMMENT ON TABLE public.user_profiles IS 'Comprehensive user profile information including personal, medical, lifestyle, and demographic data';

-- Add comments to new columns
COMMENT ON COLUMN public.user_profiles.age IS 'User age in years';
COMMENT ON COLUMN public.user_profiles.blood_group IS 'Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)';
COMMENT ON COLUMN public.user_profiles.height IS 'Height in centimeters';
COMMENT ON COLUMN public.user_profiles.weight IS 'Weight in kilograms';
COMMENT ON COLUMN public.user_profiles.existing_diseases IS 'List of existing medical conditions';
COMMENT ON COLUMN public.user_profiles.medications IS 'Current medications and dosages';
COMMENT ON COLUMN public.user_profiles.allergies IS 'Known allergies';
COMMENT ON COLUMN public.user_profiles.family_history IS 'Family medical history';
COMMENT ON COLUMN public.user_profiles.smoking IS 'Smoking status (no, yes, former)';
COMMENT ON COLUMN public.user_profiles.alcohol IS 'Alcohol consumption (no, occasional, moderate, heavy)';
COMMENT ON COLUMN public.user_profiles.diet IS 'Diet type (vegetarian, vegan, non_vegetarian, pescatarian)';
COMMENT ON COLUMN public.user_profiles.exercise IS 'Exercise frequency';
COMMENT ON COLUMN public.user_profiles.sleep_hours IS 'Average sleep hours per day';
COMMENT ON COLUMN public.user_profiles.occupation IS 'User occupation/profession';
COMMENT ON COLUMN public.user_profiles.region IS 'State or region';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if all columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- ============================================
-- SUCCESS! 🎉
-- ============================================
-- The user_profiles table now includes:
-- ✅ Personal Info: name, age, gender, blood group, height, weight, DOB
-- ✅ Medical Info: diseases, medications, allergies, family history
-- ✅ Lifestyle: smoking, alcohol, diet, exercise, sleep
-- ✅ Contact/Demographic: phone, address, occupation, city, region, country
-- ============================================
