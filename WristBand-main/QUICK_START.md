# 🚀 Quick Start Guide - Wristband Monitor

## What's Already Working

Your application has **complete authentication and user-specific data isolation** already implemented:

✅ **Login/Signup Pages** - Users can create accounts and sign in  
✅ **Protected Dashboard** - Only authenticated users can access  
✅ **User-Specific Data** - Each user sees only their own wristband data  
✅ **Real-time Updates** - Dashboard auto-refreshes every 10 seconds  
✅ **Analytics Page** - Time-range filtering, device filtering, CSV export  

## 📋 Setup Steps

### Step 1: Database Setup (REQUIRED - One-time only)

You need to run the SQL migration to add user authentication to your database:

1. **Open Supabase Dashboard** → Go to your project → **SQL Editor**

2. **Copy and paste ALL the SQL** from `DATABASE_SETUP.md` into the SQL editor

3. **Click "Run"** - This will:
   - Add `user_id` column to `wristband_data` table
   - Enable Row Level Security (RLS) to isolate user data
   - Create user profiles table
   - Set up automatic profile creation on signup

### Step 2: Create Demo User & Test Data (OPTIONAL)

**Choose ONE of these methods:**

#### Method A: Automated Script (Easiest) ⭐ RECOMMENDED

1. **Add your service role key** to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   Get it from: Supabase Dashboard → Settings → API → `service_role` (secret)

2. **Run the seed script**:
   ```powershell
   npm run seed
   ```

3. **Done!** The script creates the demo user and 20 wristband readings automatically.

#### Method B: Supabase Dashboard UI (Manual)

1. **Create the user**:
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User"
   - Email: `demo.user@example.com`
   - Password: `DemoPass123!`
   - Toggle "Auto Confirm User" ON
   - Click "Create User"

2. **Get the user ID**:
   - Click on the newly created user
   - Copy their ID (UUID format)

3. **Add test data**:
   - Open `supabase/seeds/create_demo_user_and_wristband_data.sql`
   - Replace every `:USER_ID` with the copied UUID (keep the quotes)
   - Open Supabase Dashboard → SQL Editor
   - Paste and run the modified INSERT statements

### Step 3: Start the Application

```powershell
cd multi_waist
npm run dev
```

Visit `http://localhost:3000` - you'll be redirected to the login page.

## 🔐 Demo Credentials

If you created the demo user in Step 2:

- **Email**: `demo.user@example.com`
- **Password**: `DemoPass123!`

Or create your own account using the signup form!

## 📱 How It Works

### Authentication Flow

1. **New users** → Visit `/auth` → Click "Sign up" → Enter details → Account created
2. **Existing users** → Visit `/auth` → Sign in → Redirected to `/dashboard`
3. **Protected routes** → `/dashboard/*` requires authentication (auto-redirects if not logged in)

### Data Isolation

- Each user has a unique `user_id` (UUID)
- All wristband data is linked to `user_id`
- Row Level Security (RLS) ensures:
  - Users can **only see** their own data
  - Users can **only insert** data with their own `user_id`
  - Users **cannot access** other users' data

### Dashboard Features

#### Live Monitor (`/dashboard`)
- Shows real-time vitals from all your devices
- Auto-refreshes every 10 seconds
- Color-coded status indicators (green/yellow/red)
- Device cards with Heart Rate, Temperature, SpO2, Blood Pressure

#### Analytics (`/dashboard/analytics`)
- Historical data visualization
- Time range filtering (24h, 7d, 30d, All)
- Device filtering
- Statistics: Average, Min, Max, Latest values
- Export to CSV

## 🔌 API Integration

When your wristband devices send data, they must include the `user_id`:

### API Endpoint: `/api/data`

**Method**: POST

**Required Body**:
```json
{
  "user_id": "user-uuid-here",
  "device_id": "device-001",
  "heart_rate": 72,
  "body_temp": 36.6,
  "spo2": 98
}
```

**Optional Fields**: `systolic`, `diastolic` (blood pressure)

**Validation**:
- Heart Rate: 30-250 bpm
- Temperature: 30-45°C
- SpO2: 70-100%
- Blood Pressure: Systolic 50-250, Diastolic 30-150

### Getting User ID

After login, you can get the user's ID from their session:
```javascript
import { createClientComponentClient } from '@/lib/auth';

const supabase = createClientComponentClient();
const { data: { user } } = await supabase.auth.getUser();
console.log(user.id); // This is the user_id to send with wristband data
```

## 📂 Project Structure

```
src/
├── app/
│   ├── auth/page.js              # Login/Signup page
│   ├── dashboard/
│   │   ├── layout.js             # Protected layout with nav
│   │   ├── page.js               # Live monitor dashboard
│   │   └── analytics/page.js     # Analytics & historical data
│   ├── api/data/route.js         # Wristband data ingestion endpoint
│   └── page.js                   # Root (redirects to /auth)
├── lib/
│   ├── auth.js                   # Authentication helpers
│   └── constants.js              # Shared constants
└── components/ui/                # Reusable UI components
```

## 🔍 Troubleshooting

### "No data showing in dashboard"

1. ✅ Check database migration was run (Step 1)
2. ✅ Verify user is logged in (check email in top nav)
3. ✅ Ensure wristband data has correct `user_id` in database
4. ✅ Check browser console for errors (F12 → Console tab)

### "Can't sign up / Invalid credentials"

1. ✅ Check `.env.local` has correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. ✅ Verify email confirmation is enabled in Supabase Dashboard → Authentication → Settings
3. ✅ Check Supabase email provider is enabled

### "API returns 400 error"

1. ✅ Ensure request includes `user_id` in the body
2. ✅ Verify all required fields are present: `device_id`, `heart_rate`, `body_temp`, `spo2`
3. ✅ Check values are within valid ranges (see API Integration section)

## 🎯 Next Steps

### For Development
- [ ] Run database migration (Step 1 above)
- [ ] Test with demo user or create your own account
- [ ] Configure your wristband devices to send `user_id` with data

### Optional Enhancements
- [ ] Add email verification flow
- [ ] Implement password reset
- [ ] Add social login (Google, GitHub)
- [ ] Create device pairing/registration UI
- [ ] Add user profile editing
- [ ] Implement alert notifications for abnormal vitals
- [ ] Add data export/backup features

## 📚 Additional Documentation

- `DATABASE_SETUP.md` - Complete SQL migration scripts
- `AUTHENTICATION_GUIDE.md` - Detailed auth implementation guide
- `OPTIMIZATION_SUMMARY.md` - Performance optimizations applied
- `supabase/seeds/create_demo_user_and_wristband_data.sql` - Demo user seed data

## 🆘 Need Help?

- Check the browser console (F12) for error messages
- Review Supabase logs in Dashboard → Logs
- Verify RLS policies in Database → Policies
- Test API endpoint with Postman or curl

---

**You're all set!** 🎉 Just run the database migration and you can start using the app immediately.
