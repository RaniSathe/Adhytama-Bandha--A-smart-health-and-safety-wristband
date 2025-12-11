# 🌱 Database Seeding Guide

## Quick Start - Create Demo User with Data

### ✅ Prerequisites

1. **Database migration completed** - Run the SQL from `DATABASE_SETUP.md` first
2. **Environment variables set** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

Get your service role key: Supabase Dashboard → Settings → API → `service_role` (keep it secret!)

### 🚀 Run the Seed Script

```powershell
npm run seed
```

This will:
- ✅ Create a demo user (or use existing if already created)
- ✅ Insert 20 wristband data readings across 5 devices
- ✅ Data spread across the last 2 hours

### 🔐 Demo Credentials

```
Email: demo.user@example.com
Password: DemoPass123!
```

### 📊 What Gets Created

**User:**
- Email: demo.user@example.com
- Full Name: Demo User
- Email confirmed: Yes

**Wristband Data (20 entries):**
- 5 devices: device-001 through device-005
- Heart rate: 60-90 bpm
- Temperature: 36.3-37.1°C
- SpO2: 95-99%
- Blood pressure: 110-130 / 70-88 mmHg
- Timestamps: Last 2 hours (spread across devices)

### 🔧 Troubleshooting

**Error: Missing environment variables**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Get it from Supabase Dashboard → Settings → API

**Error: User already exists**
- The script will reuse the existing user and add more data
- This is safe and expected if you run it multiple times

**Error: relation "wristband_data" does not exist**
- Run the database migration from `DATABASE_SETUP.md` first
- Make sure the table has `user_id` column

**Error: insert or update on table violates foreign key constraint**
- The `user_id` column must reference `auth.users(id)`
- Run the full migration from `DATABASE_SETUP.md`

### 🎯 Alternative: Manual UI Method

If you prefer not to use the service role key:

1. **Create user via Dashboard**:
   - Supabase Dashboard → Authentication → Users → Add User
   - Email: demo.user@example.com
   - Password: DemoPass123!
   - Toggle "Auto Confirm User" ON

2. **Get user ID**:
   - Click on the user in the list
   - Copy their UUID

3. **Run SQL manually**:
   - Open `supabase/seeds/create_demo_user_and_wristband_data.sql`
   - Replace all `:USER_ID` with the copied UUID
   - Run in SQL Editor

### 📝 Script Location

`scripts/seed-demo-user.js` - Node.js script that uses Supabase Admin API

### ✨ Next Steps

After seeding:
1. Start your app: `npm run dev`
2. Visit: `http://localhost:3000`
3. Login with demo credentials
4. See your data in the dashboard!

### 🔒 Security Note

⚠️ **Never commit your service role key to version control!**

The `.env.local` file is already in `.gitignore`, but double-check:
- Keep service role key secret
- Only use it in local development
- Use Dashboard UI method in production/shared environments
