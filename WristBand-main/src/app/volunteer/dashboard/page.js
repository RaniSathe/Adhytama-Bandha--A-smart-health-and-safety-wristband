"use client";
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/auth';
import { getVolunteerSession, volunteerSignOut } from '@/lib/volunteerAuth';
import { Heart, LogOut, User, Users, Activity, Thermometer, Droplet, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function VolunteerDashboard() {
  const [volunteer, setVolunteer] = useState(null);
  const [allUsersData, setAllUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  // Vital status helper - returns status level
  const getVitalStatusLevel = useCallback((type, value) => {
    const ranges = {
      hr: { critical: [60, 100], warning: [70, 90] },
      temp: { critical: [36, 37.5], warning: [36.5, 37.2] },
      spo2: { critical: 95, warning: 97 }
    };
    
    const range = ranges[type];
    if (!range) return 'normal';
    
    if (type === 'hr' || type === 'temp') {
      if (value < range.critical[0] || value > range.critical[1]) return 'danger';
      if (value < range.warning[0] || value > range.warning[1]) return 'moderate';
      return 'normal';
    } else if (type === 'spo2') {
      if (value < range.critical) return 'danger';
      if (value < range.warning) return 'moderate';
      return 'normal';
    }
    
    return 'normal';
  }, []);

  // Vital status helper - returns color class
  const getVitalStatus = useCallback((type, value) => {
    const level = getVitalStatusLevel(type, value);
    if (level === 'danger') return 'text-red-500';
    if (level === 'moderate') return 'text-yellow-500';
    return 'text-green-500';
  }, [getVitalStatusLevel]);

  // Calculate overall patient status
  const getPatientStatus = useCallback((record) => {
    const hrStatus = getVitalStatusLevel('hr', record.hr);
    const tempStatus = getVitalStatusLevel('temp', record.temp);
    const spo2Status = getVitalStatusLevel('spo2', record.spo2);
    
    // If any vital is in danger, patient is in danger
    if (hrStatus === 'danger' || tempStatus === 'danger' || spo2Status === 'danger') {
      return 'danger';
    }
    
    // If any vital is moderate, patient is moderate
    if (hrStatus === 'moderate' || tempStatus === 'moderate' || spo2Status === 'moderate') {
      return 'moderate';
    }
    
    return 'normal';
  }, [getVitalStatusLevel]);

  // Calculate analytics from all users data
  const analytics = useMemo(() => {
    if (allUsersData.length === 0) {
      return {
        dangerCount: 0,
        moderateCount: 0,
        normalCount: 0,
        totalPatients: 0,
        chartData: [],
        pieData: [],
        avgHR: 0,
        avgTemp: 0,
        avgSpO2: 0
      };
    }

    let dangerCount = 0;
    let moderateCount = 0;
    let normalCount = 0;
    let totalHR = 0;
    let totalTemp = 0;
    let totalSpO2 = 0;

    allUsersData.forEach(record => {
      const status = getPatientStatus(record);
      if (status === 'danger') dangerCount++;
      else if (status === 'moderate') moderateCount++;
      else normalCount++;

      totalHR += record.hr;
      totalTemp += record.temp;
      totalSpO2 += record.spo2;
    });

    const total = allUsersData.length;

    return {
      dangerCount,
      moderateCount,
      normalCount,
      totalPatients: total,
      chartData: [
        { name: 'Critical', count: dangerCount, color: '#ef4444' },
        { name: 'Moderate', count: moderateCount, color: '#f59e0b' },
        { name: 'Normal', count: normalCount, color: '#10b981' }
      ],
      pieData: [
        { name: 'Critical', value: dangerCount, color: '#ef4444' },
        { name: 'Moderate', value: moderateCount, color: '#f59e0b' },
        { name: 'Normal', value: normalCount, color: '#10b981' }
      ],
      avgHR: (totalHR / total).toFixed(1),
      avgTemp: (totalTemp / total).toFixed(1),
      avgSpO2: (totalSpO2 / total).toFixed(1),
      totalCount: total
    };
  }, [allUsersData, getPatientStatus]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (volunteer) {
      fetchAllUsersData();
      const interval = setInterval(fetchAllUsersData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [volunteer, fetchAllUsersData]);

  const checkAuth = useCallback(() => {
    const session = getVolunteerSession();
    
    if (!session) {
      router.push('/volunteer/auth');
      return;
    }
    
    setVolunteer(session);
  }, [router]);

  const fetchAllUsersData = useCallback(async () => {
    try {
      setError(null);
      console.log('🏥 Volunteer: Fetching all users data...');
      
      // Fetch all wristband data from all users
      const { data: wristbandData, error: wristbandError } = await supabase
        .from('wristband_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (wristbandError) {
        console.error('❌ Volunteer: Error fetching wristband data:', wristbandError);
        setError('Failed to fetch patient data');
        return;
      }
      
      console.log('✅ Volunteer: Fetched', wristbandData?.length || 0, 'records');
      
      // Group by user_id and device_id, get latest reading for each
      const groupedData = {};
      
      wristbandData?.forEach(record => {
        const key = `${record.user_id}-${record.device_id}`;
        if (!groupedData[key] || new Date(record.created_at) > new Date(groupedData[key].created_at)) {
          groupedData[key] = record;
        }
      });
      
      setAllUsersData(Object.values(groupedData));
      
    } catch (err) {
      console.error('❌ Volunteer: Fatal error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  function handleSignOut() {
    volunteerSignOut();
    router.push('/volunteer/auth');
  }

  if (!volunteer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-full mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-black font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-rose-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-rose-500 to-red-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-black">Volunteer Dashboard</span>
                <p className="text-xs text-gray-600">Monitoring all patients</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-lg">
                <User className="w-4 h-4 text-rose-900" />
                <div className="text-right">
                  <span className="text-sm font-medium text-rose-900 block">{volunteer.name}</span>
                  <span className="text-xs text-rose-600">{volunteer.email}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2 border-rose-200 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Patient Monitoring</h1>
              <p className="text-gray-600">Real-time health data from all connected patients</p>
            </div>
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border border-rose-100">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-rose-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Devices</p>
                  <p className="text-2xl font-bold text-black">{allUsersData.length}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Analytics Dashboard */}
          {!loading && allUsersData.length > 0 && (
            <div className="mb-8 space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Danger Count */}
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-500 rounded-xl">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {analytics.dangerCount}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Critical Status</h3>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {((analytics.dangerCount / analytics.totalPatients) * 100).toFixed(1)}%
                  </p>
                </Card>

                {/* Moderate Count */}
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-500 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">
                      {analytics.moderateCount}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Moderate Risk</h3>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">
                    {((analytics.moderateCount / analytics.totalPatients) * 100).toFixed(1)}%
                  </p>
                </Card>

                {/* Normal Count */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-green-500 text-white text-lg px-3 py-1">
                      {analytics.normalCount}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase">Normal Status</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {((analytics.normalCount / analytics.totalPatients) * 100).toFixed(1)}%
                  </p>
                </Card>

                {/* Average Vitals */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Avg Vitals</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-black"><span className="font-semibold">HR:</span> {analytics.avgHR} bpm</p>
                    <p className="text-black"><span className="font-semibold">Temp:</span> {analytics.avgTemp}°C</p>
                    <p className="text-black"><span className="font-semibold">SpO2:</span> {analytics.avgSpO2}%</p>
                  </div>
                </Card>
              </div>

              {/* Simple Bar Chart Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Status Distribution */}
                <Card className="p-6 bg-white border-gray-200">
                  <h3 className="text-lg font-bold text-black mb-6">Patient Status Distribution</h3>
                  <div className="space-y-4">
                    {analytics.chartData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-black">{item.name}</span>
                          <span className="text-sm font-bold" style={{ color: item.color }}>{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(item.count / analytics.totalCount) * 100}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Status Breakdown */}
                <Card className="p-6 bg-white border-gray-200">
                  <h3 className="text-lg font-bold text-black mb-6">Status Breakdown</h3>
                  <div className="space-y-4">
                    {analytics.pieData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: item.color + '40', backgroundColor: item.color + '10' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-black">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-black">{item.value}</div>
                          <div className="text-xs text-gray-500">{((item.value / analytics.totalCount) * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Data Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 via-pink-100 to-red-100 rounded-full mb-4 animate-pulse shadow-lg">
              <Activity className="w-8 h-8 text-rose-600" />
            </div>
            <p className="text-black font-medium">Loading patient data...</p>
          </div>
        ) : allUsersData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg border border-rose-100">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-100 to-red-100 rounded-full mb-6">
              <Users className="w-12 h-12 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">No Patient Data</h2>
            <p className="text-gray-600 mb-4">No wristband data available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {allUsersData.map((record, idx) => {
              const patientStatus = getPatientStatus(record);
              const statusColors = {
                danger: { bg: 'border-red-300 bg-red-50/30', badge: 'bg-red-500', text: 'text-red-700' },
                moderate: { bg: 'border-yellow-300 bg-yellow-50/30', badge: 'bg-yellow-500', text: 'text-yellow-700' },
                normal: { bg: 'border-green-300 bg-green-50/30', badge: 'bg-green-500', text: 'text-green-700' }
              };
              const colors = statusColors[patientStatus];

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl p-6 shadow-xl border-2 ${colors.bg} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${colors.badge} flex items-center justify-center`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">Patient {record.user_id?.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">Device: {record.device_id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${colors.badge} text-white text-xs`}>
                        {patientStatus.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(record.created_at).toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>

                {/* Vitals */}
                <div className="space-y-3">
                  {/* Heart Rate */}
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Heart Rate</span>
                    </div>
                    <span className={`text-lg font-bold ${getVitalStatus('hr', record.hr)}`}>
                      {record.hr} <span className="text-sm font-normal">bpm</span>
                    </span>
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Temperature</span>
                    </div>
                    <span className={`text-lg font-bold ${getVitalStatus('temp', record.temp)}`}>
                      {record.temp}°<span className="text-sm font-normal">C</span>
                    </span>
                  </div>

                  {/* SpO2 */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">SpO2</span>
                    </div>
                    <span className={`text-lg font-bold ${getVitalStatus('spo2', record.spo2)}`}>
                      {record.spo2}<span className="text-sm font-normal">%</span>
                    </span>
                  </div>

                  {/* Blood Pressure */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Blood Pressure</span>
                    </div>
                    <span className="text-lg font-bold text-black">
                      {record.bp_sys}/{record.bp_dia} <span className="text-sm font-normal">mmHg</span>
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
