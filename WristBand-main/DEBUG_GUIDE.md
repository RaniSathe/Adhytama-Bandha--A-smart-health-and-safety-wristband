# 🔍 DEBUG GUIDE - Data Not Showing Issue

## I've Added Debug Logging

The dashboard and analytics pages now have detailed console logging to help identify the issue.

## 🚀 Steps to Debug

### 1. Start the App (if not running)

```powershell
npm run dev
```

### 2. Open Browser Console

1. Visit `http://localhost:3000`
2. Login with:
   - Email: `demo.user@example.com`
   - Password: `DemoPass123!`
3. **Press F12** to open Developer Tools
4. Go to **Console** tab

### 3. Check the Console Output

You should see logs like this:

```
✅ User authenticated: [UUID] demo.user@example.com
📊 Query result: { error: 'none', rowCount: 20, data: [...] }
✅ Setting data: 20 records
```

## 🎯 What to Look For

### ✅ GOOD - Data is Loading

If you see:
```
✅ User authenticated: abc123... demo.user@example.com
📊 Query result: { error: 'none', rowCount: 20 }
✅ Setting data: 20 records
```

**This means:**
- User is authenticated ✅
- Database query returned 20 records ✅
- Data is being set in state ✅

**If data still doesn't show:** The issue is in rendering. Check browser console for React errors.

---

### ❌ PROBLEM 1: No User Found

If you see:
```
❌ No user found
```

**Solution:**
1. You're not logged in properly
2. Clear browser cookies
3. Logout and login again
4. Check `.env.local` has correct Supabase keys

---

### ❌ PROBLEM 2: Database Error

If you see:
```
❌ Database error: [error message]
```

**Common errors and solutions:**

#### "relation 'wristband_data' does not exist"
- Run database migration from `DATABASE_SETUP.md`

#### "column 'user_id' does not exist"
- Run database migration from `DATABASE_SETUP.md`

#### "permission denied for table wristband_data"
- RLS policies not set up correctly
- Run all policies from `DATABASE_SETUP.md`

#### "could not find the column 'hr' in the result set"
- Wrong column names in database
- Check your table columns match: `hr`, `temp`, `spo2`, `bp_sys`, `bp_dia`

---

### ❌ PROBLEM 3: Zero Records Returned

If you see:
```
📊 Query result: { error: 'none', rowCount: 0 }
```

**This means data is not in the database. Solutions:**

#### Option A: Verify Data Exists

Run in Supabase SQL Editor:
```sql
-- Get your user ID
SELECT id FROM auth.users WHERE email = 'demo.user@example.com';

-- Check if data exists (replace YOUR-USER-ID)
SELECT COUNT(*) FROM wristband_data WHERE user_id = 'YOUR-USER-ID-HERE';
```

If count is 0, data was never inserted.

#### Option B: Re-insert Data

Use `SEED_WITH_RLS_BYPASS.sql`:

1. Get user ID from step above
2. Replace `YOUR-USER-ID-HERE` in the SQL file
3. Run the entire file in SQL Editor
4. Refresh your dashboard

---

### ❌ PROBLEM 4: Wrong User ID in Data

If you see:
```
✅ User authenticated: abc123... demo.user@example.com
📊 Query result: { error: 'none', rowCount: 0 }
```

The data exists but has a different `user_id` than your logged-in user.

**Solution:**

```sql
-- Check what user_ids exist in data
SELECT DISTINCT user_id FROM wristband_data;

-- Check your logged in user id
SELECT id FROM auth.users WHERE email = 'demo.user@example.com';

-- If they don't match, update the data:
UPDATE wristband_data 
SET user_id = 'YOUR-CORRECT-USER-ID-HERE'
WHERE user_id = 'THE-WRONG-USER-ID';
```

---

## 📋 Complete Diagnostic Checklist

Run these checks in order:

### Check 1: User Authentication
```
Browser Console → Should see: ✅ User authenticated
```
- [ ] ✅ User is authenticated
- [ ] ❌ No user found → Logout and login again

### Check 2: Database Query
```
Browser Console → Check query result
```
- [ ] ✅ rowCount > 0 → Data exists
- [ ] ❌ rowCount = 0 → Data not in database
- [ ] ❌ error present → Database or RLS issue

### Check 3: Data in Database
```sql
-- Run in SQL Editor
SELECT COUNT(*) FROM wristband_data 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo.user@example.com');
```
- [ ] ✅ Returns 20 → Data exists
- [ ] ❌ Returns 0 → Need to insert data

### Check 4: Column Names
```sql
-- Run in SQL Editor
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'wristband_data' 
ORDER BY ordinal_position;
```
Should have: `user_id`, `device_id`, `hr`, `temp`, `spo2`, `bp_sys`, `bp_dia`, `created_at`

- [ ] ✅ All columns present
- [ ] ❌ Missing columns → Run `DATABASE_SETUP.md` migration

### Check 5: RLS Policies
```sql
-- Run in SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'wristband_data';
```
Should have at least 1 SELECT policy.

- [ ] ✅ Policies exist
- [ ] ❌ No policies → Run `DATABASE_SETUP.md` migration

---

## 🔧 Quick Fixes

### Quick Fix 1: Clear Everything and Restart

```powershell
# Stop the server (Ctrl+C)
# Clear browser data for localhost:3000
# Restart server
npm run dev
```

### Quick Fix 2: Verify Supabase Connection

Check `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

Test connection in browser console (F12):
```javascript
// Type this in console
await fetch('https://YOUR-PROJECT.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'YOUR-ANON-KEY',
    'Authorization': 'Bearer YOUR-ANON-KEY'
  }
})
```

Should return 200 OK.

### Quick Fix 3: Force Re-fetch

In browser console while on dashboard:
```javascript
// Force reload data
window.location.reload()
```

---

## 📸 Screenshot the Console Output

When asking for help, take a screenshot of:
1. Browser console showing the log messages
2. Network tab showing the Supabase requests (if any)
3. Any error messages in red

---

## 🆘 Still Not Working?

Copy and paste the **complete console output** from your browser's console tab. It will look like:

```
✅ User authenticated: [UUID] demo.user@example.com
📊 Query result: { error: '...', rowCount: ..., data: [...] }
```

This will tell us exactly what's happening!
