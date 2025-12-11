# 🚨 TROUBLESHOOTING: Data Not Visible

## Most Likely Issue: Row Level Security (RLS) Blocking Inserts

When you insert data via SQL Editor, RLS policies might prevent the insert because the SQL Editor doesn't authenticate as the user.

## ✅ SOLUTION: 3-Step Fix

### Step 1: Get Your User ID

Run this in Supabase SQL Editor:

```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'demo.user@example.com';
```

**Copy the `id` value** (UUID like: `f47ac10b-58cc-4372-a567-0e02b2c3d479`)

---

### Step 2: Run This Complete Script

Open `SEED_WITH_RLS_BYPASS.sql` and:

1. **Replace** all `YOUR-USER-ID-HERE` with your copied UUID
2. **Copy the entire file**
3. **Paste into SQL Editor**
4. **Click Run**

This will:
- ✅ Temporarily disable RLS
- ✅ Insert 20 records
- ✅ Re-enable RLS
- ✅ Verify the data

---

### Step 3: Check Your Dashboard

```powershell
npm run dev
```

Visit `http://localhost:3000` and login:
- Email: `demo.user@example.com`
- Password: `DemoPass123!`

You should now see **5 devices** with data! 🎉

---

## 🔍 Still Not Working?

### Run Diagnostics

Use `DIAGNOSTIC_QUERIES.sql` to check:

1. **Does the user exist?**
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'demo.user@example.com';
   ```

2. **Are the columns correct?**
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'wristband_data';
   ```
   Should show: `user_id`, `device_id`, `hr`, `temp`, `spo2`, `bp_sys`, `bp_dia`, `created_at`

3. **Is data actually in the database?**
   ```sql
   SELECT COUNT(*) FROM wristband_data WHERE user_id = 'YOUR-USER-ID-HERE';
   ```

---

## 🎯 Alternative: Insert via API (No RLS issues)

If SQL Editor continues to have issues, you can insert data via the API endpoint:

```powershell
# In PowerShell (replace USER-ID with your actual user ID)
$userId = "YOUR-USER-ID-HERE"

# Insert 20 records via API
1..20 | ForEach-Object {
    $device = "device-00$([Math]::Floor(($_ - 1) / 4) + 1)"
    $hr = Get-Random -Minimum 60 -Maximum 90
    $temp = (Get-Random -Minimum 364 -Maximum 372) / 10
    $spo2 = Get-Random -Minimum 95 -Maximum 100
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/data?id=$device&hr=$hr&temp=$temp&spo2=$spo2&user_id=$userId" -Method Get
    Start-Sleep -Milliseconds 500
}
```

This bypasses RLS because the API uses the service connection.

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] User `demo.user@example.com` exists in Supabase Dashboard → Authentication → Users
- [ ] Database migration from `DATABASE_SETUP.md` was run successfully
- [ ] `user_id` column exists in `wristband_data` table
- [ ] Used `SEED_WITH_RLS_BYPASS.sql` (not the regular SQL file)
- [ ] Replaced ALL instances of `YOUR-USER-ID-HERE` with actual UUID
- [ ] SQL ran without errors
- [ ] Verification query shows 20 records
- [ ] App is running (`npm run dev`)
- [ ] Logged in with correct credentials

---

## 🆘 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "column user_id does not exist" | Run `DATABASE_SETUP.md` migration first |
| "relation wristband_data does not exist" | Check you're in the correct project/schema |
| "insert or update violates foreign key constraint" | User ID doesn't exist in auth.users |
| "permission denied for table wristband_data" | Use `SEED_WITH_RLS_BYPASS.sql` instead |
| Data inserted but not showing in app | Clear browser cache, check user is logged in |
| "null value in column user_id" | Make sure you replaced `YOUR-USER-ID-HERE` |

---

**Files to use:**
- ✅ `SEED_WITH_RLS_BYPASS.sql` - Main seed file (use this!)
- 🔍 `DIAGNOSTIC_QUERIES.sql` - Troubleshooting queries
- ❌ `RAW_SQL_SEED.sql` - Old version (don't use if RLS is enabled)
