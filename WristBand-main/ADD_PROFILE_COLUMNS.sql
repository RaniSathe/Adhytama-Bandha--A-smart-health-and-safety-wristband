-- Add profile columns to user_profiles table
-- Run this in Supabase SQL Editor

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
ADD COLUMN IF NOT EXISTS sleep_hours TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
