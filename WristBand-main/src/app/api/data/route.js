// src/app/api/data/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Validation helper
function validateVitalSigns(hr, temp, spo2) {
  return (
    hr && hr >= 30 && hr <= 200 &&
    spo2 && spo2 >= 70 && spo2 <= 100 &&
    temp && temp >= 30 && temp <= 45
  );
}

// Optimized BP estimation
function estimateBloodPressure(hr, spo2) {
  const bp_sys = Math.round(90 + (hr - 60) * 0.8 + (100 - spo2) * 1.2);
  const bp_dia = Math.round(60 + (hr - 60) * 0.4 + (100 - spo2) * 0.8);
  return { bp_sys: Math.max(80, Math.min(180, bp_sys)), bp_dia: Math.max(50, Math.min(110, bp_dia)) };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const device = searchParams.get('id');
    const hr = parseInt(searchParams.get('hr') || '0', 10);
    const temp = parseFloat(searchParams.get('temp') || '0');
    const spo2 = parseInt(searchParams.get('spo2') || '0', 10);
    const userId = searchParams.get('user_id'); // User ID from wristband/device

    // Validate required parameters
    if (!device || !userId || !validateVitalSigns(hr, temp, spo2)) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters (device_id, user_id, and valid vital signs required)' },
        { status: 400 }
      );
    }

    // Auto BP Estimation with range limiting
    const { bp_sys, bp_dia } = estimateBloodPressure(hr, spo2);

    // Insert data with user_id
    const { error } = await supabase.from('wristband_data').insert({
      device_id: device,
      user_id: userId,
      hr,
      temp,
      spo2,
      bp_sys,
      bp_dia
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}