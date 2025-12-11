/**
 * Seed Script - Create Demo User and Test Data
 * 
 * This script uses the Supabase Admin API to create a demo user
 * and populate 20 wristband data entries.
 * 
 * Usage:
 *   node scripts/seed-demo-user.js
 * 
 * Requirements:
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local (get from Supabase Dashboard → Settings → API)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Make sure you have these in .env.local:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nGet the service role key from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEMO_EMAIL = 'demo.user@example.com';
const DEMO_PASSWORD = 'DemoPass123!';
const DEMO_FULL_NAME = 'Demo User';

async function createDemoUser() {
  console.log('🔐 Creating demo user...');
  
  // Check if user already exists
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  
  if (!listError) {
    const existingUser = existingUsers.users?.find(u => u.email === DEMO_EMAIL);
    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.id);
      return existingUser.id;
    }
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: DEMO_FULL_NAME
    }
  });

  if (error) {
    console.error('❌ Error creating user:', error.message);
    throw error;
  }

  console.log('✅ Demo user created successfully!');
  console.log('   Email:', DEMO_EMAIL);
  console.log('   Password:', DEMO_PASSWORD);
  console.log('   User ID:', data.user.id);
  
  return data.user.id;
}

async function seedWristbandData(userId) {
  console.log('\n📊 Seeding wristband data...');

  const wristbandData = [
    { device_id: 'device-001', heart_rate: 72, body_temp: 36.6, spo2: 98, systolic: 120, diastolic: 80, minutes_ago: 120 },
    { device_id: 'device-001', heart_rate: 75, body_temp: 36.7, spo2: 97, systolic: 122, diastolic: 82, minutes_ago: 110 },
    { device_id: 'device-001', heart_rate: 70, body_temp: 36.5, spo2: 99, systolic: 118, diastolic: 78, minutes_ago: 100 },
    { device_id: 'device-002', heart_rate: 80, body_temp: 36.9, spo2: 96, systolic: 125, diastolic: 85, minutes_ago: 90 },
    { device_id: 'device-002', heart_rate: 78, body_temp: 36.8, spo2: 97, systolic: 124, diastolic: 84, minutes_ago: 80 },
    { device_id: 'device-002', heart_rate: 76, body_temp: 36.7, spo2: 97, systolic: 123, diastolic: 83, minutes_ago: 70 },
    { device_id: 'device-003', heart_rate: 65, body_temp: 36.4, spo2: 99, systolic: 115, diastolic: 75, minutes_ago: 60 },
    { device_id: 'device-003', heart_rate: 67, body_temp: 36.5, spo2: 99, systolic: 116, diastolic: 76, minutes_ago: 50 },
    { device_id: 'device-003', heart_rate: 69, body_temp: 36.6, spo2: 98, systolic: 117, diastolic: 77, minutes_ago: 40 },
    { device_id: 'device-001', heart_rate: 74, body_temp: 36.7, spo2: 97, systolic: 121, diastolic: 81, minutes_ago: 30 },
    { device_id: 'device-004', heart_rate: 90, body_temp: 37.1, spo2: 95, systolic: 130, diastolic: 88, minutes_ago: 28 },
    { device_id: 'device-004', heart_rate: 88, body_temp: 37.0, spo2: 95, systolic: 129, diastolic: 87, minutes_ago: 26 },
    { device_id: 'device-005', heart_rate: 60, body_temp: 36.3, spo2: 99, systolic: 110, diastolic: 70, minutes_ago: 24 },
    { device_id: 'device-005', heart_rate: 62, body_temp: 36.4, spo2: 99, systolic: 112, diastolic: 72, minutes_ago: 22 },
    { device_id: 'device-001', heart_rate: 73, body_temp: 36.6, spo2: 98, systolic: 120, diastolic: 80, minutes_ago: 20 },
    { device_id: 'device-002', heart_rate: 77, body_temp: 36.8, spo2: 97, systolic: 123, diastolic: 83, minutes_ago: 18 },
    { device_id: 'device-003', heart_rate: 68, body_temp: 36.5, spo2: 98, systolic: 116, diastolic: 76, minutes_ago: 15 },
    { device_id: 'device-004', heart_rate: 85, body_temp: 36.9, spo2: 96, systolic: 128, diastolic: 86, minutes_ago: 10 },
    { device_id: 'device-005', heart_rate: 63, body_temp: 36.4, spo2: 99, systolic: 113, diastolic: 73, minutes_ago: 5 },
    { device_id: 'device-001', heart_rate: 71, body_temp: 36.6, spo2: 98, systolic: 119, diastolic: 79, minutes_ago: 2 },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const reading of wristbandData) {
    const timestamp = new Date(Date.now() - reading.minutes_ago * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('wristband_data')
      .insert({
        user_id: userId,
        device_id: reading.device_id,
        heart_rate: reading.heart_rate,
        body_temp: reading.body_temp,
        spo2: reading.spo2,
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        created_at: timestamp
      });

    if (error) {
      console.error(`   ❌ Error inserting ${reading.device_id}:`, error.message);
      errorCount++;
    } else {
      successCount++;
      process.stdout.write(`   ✓ ${successCount}/20 records inserted\r`);
    }
  }

  console.log(`\n✅ Seeding complete: ${successCount} success, ${errorCount} errors`);
}

async function main() {
  console.log('🚀 Starting seed process...\n');
  
  try {
    const userId = await createDemoUser();
    await seedWristbandData(userId);
    
    console.log('\n✨ All done! You can now login with:');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log('\n🌐 Start your app: npm run dev');
    console.log('   Then visit: http://localhost:3000\n');
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

main();
