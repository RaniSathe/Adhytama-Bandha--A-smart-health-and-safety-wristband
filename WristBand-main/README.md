# 🏥 Multi-Waist Wristband Monitoring System

A comprehensive real-time health monitoring platform with separate user and volunteer portals. Monitor vital signs from wristband devices with advanced analytics, visualizations, and health status categorization.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwindcss)

---

## 🎯 Features

### 👤 User Portal
- **Real-time health monitoring** from wristband devices
- **Personal dashboard** with live vital signs
- **Advanced analytics** with interactive charts
- **Time range filtering** (1h, 6h, 24h, 7 days)
- **Device management** (multiple wristbands)
- **CSV data export**
- **Color-coded health indicators** (danger/warning/normal)
- **Auto-refresh** every 10 seconds

### 👨‍⚕️ Volunteer Portal
- **Monitor all patients** from a single dashboard
- **Aggregate analytics** showing:
  - Critical patient count (🔴 danger)
  - Moderate risk count (🟡 warning)
  - Normal patient count (🟢 healthy)
  - Average vitals across all patients
- **Visual analytics:**
  - Bar chart showing patient distribution
  - Pie chart showing status breakdown
- **Color-coded patient cards** by health status
- **Real-time monitoring** of all connected devices
- **Auto-refresh** capability

### 🔒 Security
- Row Level Security (RLS) on all database tables
- User data isolation (users see only their own data)
- Separate authentication systems (users vs volunteers)
- Password hashing with bcrypt
- Session management
- Protected routes with automatic redirects

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account ([Sign up free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd multi_waist
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

### 4. Setup Database

Run these SQL files in Supabase SQL Editor **in order**:

1. `CREATE_USER_PROFILE_TABLE.sql` - User profiles with auto-trigger
2. `CREATE_VOLUNTEER_TABLE.sql` - Volunteer authentication
3. `VERIFY_AND_FIX_USER_PROFILES.sql` - Fix existing users (STEP 5 only)
4. `SEED_WITH_RLS_BYPASS.sql` - (Optional) Test data

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Application Routes

### User Portal
- `/auth` - User login/signup
- `/dashboard` - Real-time monitoring dashboard
- `/dashboard/analytics` - Advanced analytics with charts

### Volunteer Portal
- `/volunteer/auth` - Volunteer login/signup
- `/volunteer/dashboard` - Monitor all patients with analytics

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library with server components |
| **Supabase** | PostgreSQL database + Auth + Realtime |
| **Tailwind CSS 4** | Utility-first styling |
| **Recharts** | Interactive data visualization |
| **Lucide React** | Beautiful icon library |
| **bcryptjs** | Password hashing |

---

## 📊 Database Schema

### Tables

#### `wristband_data`
Stores vital sign readings from wristband devices.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Foreign key to auth.users |
| `device_id` | TEXT | Unique device identifier |
| `hr` | INTEGER | Heart rate (bpm) |
| `temp` | NUMERIC | Body temperature (°C) |
| `spo2` | INTEGER | Blood oxygen saturation (%) |
| `bp_sys` | INTEGER | Systolic blood pressure |
| `bp_dia` | INTEGER | Diastolic blood pressure |
| `created_at` | TIMESTAMP | Reading timestamp |

#### `user_profiles`
Extended user information (auto-created on signup).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (→ auth.users) |
| `full_name` | TEXT | User's full name |
| `avatar_url` | TEXT | Profile picture URL |
| `phone` | TEXT | Phone number |
| `date_of_birth` | DATE | Date of birth |
| `gender` | TEXT | Gender |
| `address` | TEXT | Address |
| `city` | TEXT | City |
| `country` | TEXT | Country |

**Note:** Email is stored in `auth.users`, not `user_profiles`.

#### `volunteers`
Volunteer authentication (separate from users).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Volunteer name |
| `email` | TEXT | Email (unique) |
| `password_hash` | TEXT | Hashed password |
| `is_active` | BOOLEAN | Active status |
| `last_login` | TIMESTAMP | Last login time |

#### `volunteer_user_assignments`
Links volunteers to specific users (for future features).

---

## 🎨 Health Status Indicators

### Color Coding

| Status | Color | Vital Ranges |
|--------|-------|--------------|
| 🔴 **Critical** | Red | HR <60 or >100 bpm<br>Temp <36°C or >37.5°C<br>SpO2 <95% |
| 🟡 **Moderate** | Yellow | HR <70 or >90 bpm<br>Temp <36.5°C or >37.2°C<br>SpO2 <97% |
| 🟢 **Normal** | Green | All vitals in healthy ranges |

### Patient Status Logic
- If **any vital is critical** → Patient status = 🔴 DANGER
- Else if **any vital is moderate** → Patient status = 🟡 MODERATE  
- Else → Patient status = 🟢 NORMAL

---

## 🔐 Authentication Flow

### User Authentication
1. User signs up via `/auth`
2. Supabase creates account in `auth.users`
3. Database trigger auto-creates entry in `user_profiles`
4. Fallback: App creates profile if trigger fails
5. User redirected to `/dashboard`

### Volunteer Authentication
1. Volunteer signs up via `/volunteer/auth`
2. Password hashed with bcrypt
3. Account stored in `volunteers` table
4. Session saved to localStorage
5. Volunteer redirected to `/volunteer/dashboard`

**⚠️ Production Note:** Move volunteer password hashing to server-side API routes for production security.

---

## 📈 Analytics Features

### User Analytics (`/dashboard/analytics`)
- **Line charts** for Heart Rate, Temperature, SpO2 over time
- **Bar charts** for Blood Pressure trends
- **Time range filters:** 1 hour, 6 hours, 24 hours, 7 days
- **Device filtering** (view specific wristband data)
- **Average calculations** per vital sign
- **CSV export** for data analysis

### Volunteer Analytics (`/volunteer/dashboard`)
- **Status distribution cards:**
  - Critical patients count
  - Moderate risk count
  - Normal patients count
  - Average vitals across all patients
- **Bar chart:** Patient count by status
- **Pie chart:** Percentage breakdown
- **Patient cards:** Color-coded by health status with individual vital details

---

## 🧪 Testing

### Test Demo User
After running `SEED_WITH_RLS_BYPASS.sql`:

**Email:** demo.user@example.com  
**Password:** DemoPass123!  
**Data:** 20 wristband readings across 5 devices

### Testing Workflow
1. ✅ Sign up new user → Check profile created
2. ✅ Login → Check dashboard loads
3. ✅ Add wristband data (via SQL or API)
4. ✅ Verify real-time updates (wait 10s)
5. ✅ Check analytics charts display
6. ✅ Test time range filters
7. ✅ Export CSV
8. ✅ Sign up volunteer
9. ✅ Check volunteer sees all user data
10. ✅ Verify volunteer analytics calculations

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy!**
   - Vercel will automatically build and deploy
   - Get your production URL

### Build Locally

```bash
# Production build
npm run build

# Test production build
npm start
```

---

## 📂 Project Structure

```
multi_waist/
├── src/
│   ├── app/
│   │   ├── auth/                    # User authentication
│   │   ├── dashboard/               # User dashboard & analytics
│   │   ├── volunteer/               # Volunteer portal
│   │   ├── globals.css              # Global styles
│   │   ├── layout.js                # Root layout
│   │   └── page.js                  # Landing page
│   ├── components/
│   │   └── ui/                      # Reusable UI components
│   └── lib/
│       ├── auth.js                  # User auth functions
│       ├── volunteerAuth.js         # Volunteer auth functions
│       └── utils.js                 # Utilities
├── public/                          # Static assets
├── CREATE_USER_PROFILE_TABLE.sql    # DB setup: User profiles
├── CREATE_VOLUNTEER_TABLE.sql       # DB setup: Volunteers
├── VERIFY_AND_FIX_USER_PROFILES.sql # DB maintenance
├── SEED_WITH_RLS_BYPASS.sql         # Test data
├── PRODUCTION_READY_GUIDE.md        # Complete deployment guide
└── package.json
```

---

## 🔧 Common Issues & Solutions

### Issue: "Multiple GoTrueClient instances"
**Solution:** Always use `useMemo` for Supabase client:
```javascript
const supabase = useMemo(() => createClientComponentClient(), []);
```

### Issue: "Column p.email does not exist"
**Solution:** Email is in `auth.users`, not `user_profiles`. Use JOIN:
```sql
SELECT u.email, p.full_name 
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
```

### Issue: User profile not created on signup
**Solution:** Run `VERIFY_AND_FIX_USER_PROFILES.sql` STEP 5 to create missing profiles.

### Issue: Data not showing on dashboard
**Check:**
1. Is data inserted with correct `user_id`?
2. Run: `SELECT * FROM wristband_data WHERE user_id = 'your-uuid'`
3. Check browser console for errors
4. Verify RLS policies allow read

---

## 🛡️ Security Best Practices

### ✅ Implemented
- Row Level Security (RLS) on all tables
- User data isolation via RLS policies
- Password hashing with bcrypt
- Protected routes with auth checks
- Session management
- Foreign key constraints

### 🔐 Production Recommendations
1. **Move volunteer auth to server-side** (create `/api/volunteer/auth` routes)
2. **Use JWT tokens** instead of localStorage for volunteers
3. **Add rate limiting** on login attempts
4. **Enable Supabase email verification**
5. **Implement CSRF protection**
6. **Use HTTPS only** in production
7. **Add session expiry** and refresh tokens
8. **Monitor Supabase logs** for suspicious activity

---

## 📝 License

MIT License - feel free to use for personal or commercial projects.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

**Issues?** Open a GitHub issue with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS details

---

## 🎉 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Recharts](https://recharts.org/) - Chart library
- [Lucide](https://lucide.dev/) - Icons

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** ✅ Production Ready

---

## 🚀 Start Monitoring Health Today!

1. Clone the repo
2. Configure Supabase
3. Run the app
4. Monitor vital signs in real-time! 🏥
#   m u l t i - w a i s t 
 
 #   W r i s t B a n d  
 