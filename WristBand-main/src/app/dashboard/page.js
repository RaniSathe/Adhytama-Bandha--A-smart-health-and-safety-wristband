"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClientComponentClient } from '@/lib/auth';
import { Heart, Thermometer, Droplet, Activity, Wifi, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Vital ranges configuration
const VITAL_RANGES = {
  hr: { critical: [60, 100], warning: [70, 90] },
  temp: { critical: [36, 37.5], warning: [36.5, 37.2] },
  spo2: { critical: 95, warning: 97 },
  bp: { 
    critical: { sys: [90, 140], dia: [60, 90] },
    warning: { sys: [100, 130], dia: [65, 85] }
  }
};

function getVitalStatus(type, value) {
  const ranges = VITAL_RANGES[type];
  if (!ranges) return 'text-gray-500';
  
  switch(type) {
    case 'hr':
      if (value < ranges.critical[0] || value > ranges.critical[1]) return 'text-red-500';
      if (value < ranges.warning[0] || value > ranges.warning[1]) return 'text-yellow-500';
      return 'text-green-500';
    case 'temp':
      if (value < ranges.critical[0] || value > ranges.critical[1]) return 'text-red-500';
      if (value < ranges.warning[0] || value > ranges.warning[1]) return 'text-yellow-500';
      return 'text-green-500';
    case 'spo2':
      if (value < ranges.critical) return 'text-red-500';
      if (value < ranges.warning) return 'text-yellow-500';
      return 'text-green-500';
    case 'bp':
      const [sys, dia] = value;
      const { critical, warning } = ranges;
      if (sys > critical.sys[1] || sys < critical.sys[0] || dia > critical.dia[1] || dia < critical.dia[0]) 
        return 'text-red-500';
      if (sys > warning.sys[1] || sys < warning.sys[0] || dia > warning.dia[1] || dia < warning.dia[0]) 
        return 'text-yellow-500';
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Create supabase client once with useMemo to prevent infinite loops
  const supabase = useMemo(() => createClientComponentClient(), []);

  const fetchData = useCallback(async () => {
    try {
      // Check if Supabase client is initialized
      if (!supabase) {
        console.error('❌ Dashboard: Supabase client not initialized');
        setLoading(false);
        return;
      }

      console.log('🔌 Dashboard: Supabase client ready');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ No user found');
        setLoading(false);
        return;
      }
      
      console.log('✅ User authenticated:', user.id, user.email);
      setUser(user);

      // Fetch only current user's data
      const { data: wristbandData, error } = await supabase
        .from('wristband_data')
        .select('device_id, hr, temp, spo2, bp_sys, bp_dia, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      console.log('📊 Query result:', { 
        error: error ? error.message : 'none',
        rowCount: wristbandData ? wristbandData.length : 0,
        sample: wristbandData ? wristbandData.slice(0, 2) : []
      });

      if (error) {
        console.error('❌ Database error:', error);
      } else if (wristbandData) {
        console.log('✅ Setting data:', wristbandData.length, 'records');
        setData(wristbandData);
      }
    } catch (error) {
      console.error('❌ Fatal error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('wristband_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wristband_data'
      }, () => {
        fetchData();
      })
      .subscribe();

    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchData, supabase]);

  // Create device-to-latest-data map
  const deviceMap = new Map();
  data?.forEach(d => {
    if (!deviceMap.has(d.device_id)) {
      deviceMap.set(d.device_id, d);
    }
  });
  
  const devices = Array.from(deviceMap.keys());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-medium">Loading your wristband data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Navigation Buttons */}
      <div className="mb-8 flex justify-end gap-4 animate-slide-in">
        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <Link href="/dashboard/profile" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:inline">My Profile</span>
            <span className="sm:hidden">Profile</span>
          </Link>
        </Button>
        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:via-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <Link href="/dashboard/analytics" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
              <rect x="7" y="13" width="2" height="5" rx="1" />
              <rect x="11" y="9" width="2" height="9" rx="1" />
              <rect x="15" y="5" width="2" height="13" rx="1" />
            </svg>
            <span className="hidden sm:inline">Analytics Dashboard</span>
            <span className="sm:hidden">Analytics</span>
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 animate-slide-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl shadow-md">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-black">
              {devices.length} Device{devices.length !== 1 ? 's' : ''} Connected
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-full border border-blue-100">
            <Clock className="w-4 h-4 text-blue-900" />
            <span className="text-sm font-medium text-blue-900">Auto-refresh: 10s</span>
          </div>
        </div>
      </div>

      {/* Device Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device, index) => {
          const latest = deviceMap.get(device);
          if (!latest) return null;

          const hrStatus = getVitalStatus('hr', latest.hr);
          const tempStatus = getVitalStatus('temp', latest.temp);
          const spo2Status = getVitalStatus('spo2', latest.spo2);
          const bpStatus = getVitalStatus('bp', [latest.bp_sys, latest.bp_dia]);

          return (
            <div 
              key={device} 
              className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-blue-100/50 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500 hover:-translate-y-2 transform relative overflow-hidden animate-slide-in"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-teal-50/0 to-emerald-50/0 group-hover:from-blue-50/50 group-hover:via-teal-50/30 group-hover:to-emerald-50/50 transition-all duration-500 pointer-events-none"></div>
              
              {/* Device Header */}
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <h2 className="text-xl font-bold text-black group-hover:text-blue-600 transition-colors duration-300">
                    {device}
                  </h2>
                </div>
                <div className="p-2 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg opacity-0 group-hover:opacity-100 transform group-hover:rotate-12 transition-all duration-300">
                  <TrendingUp className="w-5 h-5 text-blue-900" />
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="relative grid grid-cols-2 gap-4">
                {/* Heart Rate */}
                <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-100/50 hover:shadow-lg hover:border-red-200 transition-all duration-300 hover:scale-105 transform group/vital">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100/0 to-rose-100/0 group-hover/vital:from-red-100/30 group-hover/vital:to-rose-100/30 rounded-2xl transition-all duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-md group-hover/vital:shadow-lg group-hover/vital:scale-110 transition-all duration-300">
                      <Heart className="w-6 h-6 text-red-700 group-hover/vital:text-red-800 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-black font-semibold uppercase tracking-wide">Heart Rate</p>
                      <p className={`text-2xl font-bold ${hrStatus} group-hover/vital:scale-110 transition-transform inline-block`}>
                        {latest.hr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100/50 hover:shadow-lg hover:border-orange-200 transition-all duration-300 hover:scale-105 transform group/vital">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100/0 to-amber-100/0 group-hover/vital:from-orange-100/30 group-hover/vital:to-amber-100/30 rounded-2xl transition-all duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-md group-hover/vital:shadow-lg group-hover/vital:scale-110 transition-all duration-300">
                      <Thermometer className="w-6 h-6 text-orange-700 group-hover/vital:text-orange-800 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-black font-semibold uppercase tracking-wide">Temp</p>
                      <p className={`text-2xl font-bold ${tempStatus} group-hover/vital:scale-110 transition-transform inline-block`}>
                        {latest.temp}°C
                      </p>
                    </div>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:scale-105 transform group/vital">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 to-cyan-100/0 group-hover/vital:from-blue-100/30 group-hover/vital:to-cyan-100/30 rounded-2xl transition-all duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-md group-hover/vital:shadow-lg group-hover/vital:scale-110 transition-all duration-300">
                      <Droplet className="w-6 h-6 text-blue-700 group-hover/vital:text-blue-800 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-black font-semibold uppercase tracking-wide">SpO2</p>
                      <p className={`text-2xl font-bold ${spo2Status} group-hover/vital:scale-110 transition-transform inline-block`}>
                        {latest.spo2}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100/50 hover:shadow-lg hover:border-purple-200 transition-all duration-300 hover:scale-105 transform group/vital">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100/0 to-indigo-100/0 group-hover/vital:from-purple-100/30 group-hover/vital:to-indigo-100/30 rounded-2xl transition-all duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-xl shadow-md group-hover/vital:shadow-lg group-hover/vital:scale-110 transition-all duration-300">
                      <Activity className="w-6 h-6 text-purple-700 group-hover/vital:text-purple-800 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-black font-semibold uppercase tracking-wide">BP</p>
                      <p className={`text-lg font-bold ${bpStatus} group-hover/vital:scale-110 transition-transform inline-block`}>
                        {latest.bp_sys}/{latest.bp_dia}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative mt-6 pt-4 border-t border-gray-100/50">
                <div className="flex items-center justify-center gap-2 text-xs text-black">
                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                  <span className="font-medium">Updated: {new Date(latest.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {devices.length === 0 && (
        <div className="text-center py-24 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 via-teal-100 to-emerald-100 rounded-full mb-8 animate-pulse shadow-lg">
            <Activity className="w-12 h-12 text-blue-900 animate-float" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            No wristband data yet
          </h3>
          <p className="text-black max-w-md mx-auto px-4">
            Connect your wristband devices to start monitoring your health vitals in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
