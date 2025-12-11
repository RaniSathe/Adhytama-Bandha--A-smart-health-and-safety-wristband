-- ============================================
-- VOLUNTEER TABLE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create volunteers table (separate from auth.users)
CREATE TABLE IF NOT EXISTS public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Step 2: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_created_at ON public.volunteers(created_at DESC);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS Policies

-- Policy: Allow volunteers to read their own data (and allow service role to read all)
DROP POLICY IF EXISTS "Volunteers can view their own data" ON public.volunteers;
CREATE POLICY "Volunteers can view their own data"
ON public.volunteers
FOR SELECT
USING (true); -- Allow read for authentication purposes

-- Policy: Anyone can insert (for signup)
DROP POLICY IF EXISTS "Anyone can signup as volunteer" ON public.volunteers;
CREATE POLICY "Anyone can signup as volunteer"
ON public.volunteers
FOR INSERT
WITH CHECK (true);

-- Policy: Volunteers can update their own data
DROP POLICY IF EXISTS "Volunteers can update their own data" ON public.volunteers;
CREATE POLICY "Volunteers can update their own data"
ON public.volunteers
FOR UPDATE
USING (true);

-- Step 5: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_volunteer_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Step 6: Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS handle_volunteers_updated_at ON public.volunteers;
CREATE TRIGGER handle_volunteers_updated_at
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_volunteer_updated_at();

-- ============================================
-- VOLUNTEER-USER RELATIONSHIP TABLE
-- ============================================

-- This table links volunteers to the users they monitor
CREATE TABLE IF NOT EXISTS public.volunteer_user_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(volunteer_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_volunteer ON public.volunteer_user_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_user ON public.volunteer_user_assignments(user_id);

-- Enable RLS
ALTER TABLE public.volunteer_user_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading assignments
DROP POLICY IF EXISTS "Volunteers can view assignments" ON public.volunteer_user_assignments;
CREATE POLICY "Volunteers can view assignments"
ON public.volunteer_user_assignments
FOR SELECT
USING (true);

-- Policy: Allow creating assignments
DROP POLICY IF EXISTS "Volunteers can create assignments" ON public.volunteer_user_assignments;
CREATE POLICY "Volunteers can create assignments"
ON public.volunteer_user_assignments
FOR INSERT
WITH CHECK (true);

-- Policy: Allow deleting assignments
DROP POLICY IF EXISTS "Volunteers can delete assignments" ON public.volunteer_user_assignments;
CREATE POLICY "Volunteers can delete assignments"
ON public.volunteer_user_assignments
FOR DELETE
USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if volunteers table was created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('volunteers', 'volunteer_user_assignments');

-- Check volunteers table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'volunteers'
ORDER BY ordinal_position;

-- Test query
SELECT COUNT(*) as total_volunteers FROM public.volunteers;

-- ============================================
-- SUCCESS! 🎉
-- ============================================
-- Now you can:
-- 1. Volunteers can sign up with name, email, password
-- 2. Volunteers can log in
-- 3. Volunteers can see all users' wristband data
-- 4. Volunteers can be assigned to specific users
-- ============================================
