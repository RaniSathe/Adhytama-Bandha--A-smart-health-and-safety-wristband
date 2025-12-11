"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createClientComponentClient } from "@/lib/auth";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Activity, Heart, Thermometer, Droplet, BarChart3, Download, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Time range constants
const TIME_RANGES = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

// StatCard component - Memoized for performance
const StatCard = ({ title, value, unit, icon: Icon, trend, color, iconColor }) => {
  const TrendIcon = parseFloat(trend) >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200/50 hover:shadow-2xl hover:border-blue-200/50 transition-all duration-500 hover:-translate-y-1 transform overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-teal-50/0 to-emerald-50/0 group-hover:from-blue-50/30 group-hover:via-teal-50/20 group-hover:to-emerald-50/30 transition-all duration-500 pointer-events-none"></div>
      
      <div className="relative flex items-center justify-between mb-4">
        <div className={`p-3.5 rounded-xl shadow-md bg-gradient-to-br ${color} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor || 'text-gray-900'}`} />
        </div>
        {trend && (
          <Badge variant={parseFloat(trend) >= 0 ? "success" : "destructive"} className="flex items-center gap-1.5 px-3 py-1.5">
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm">{Math.abs(trend)}%</span>
          </Badge>
        )}
      </div>
      <p className="text-sm text-black font-semibold uppercase tracking-wide mb-2">{title}</p>
      <p className="text-3xl font-bold text-black group-hover:text-blue-600 transition-colors duration-300">
        {value} <span className="text-lg font-normal text-black">{unit}</span>
      </p>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [deviceFilter, setDeviceFilter] = useState("ALL");
  
  // Create supabase client once with useMemo to prevent infinite loops
  const supabase = useMemo(() => createClientComponentClient(), []);

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (!filtered || filtered.length === 0) {
      return {};
    }

    const devices = [...new Set(filtered.map((d) => d.device_id))];
    const latest = filtered[filtered.length - 1];
    const previous = filtered[filtered.length - 2];
    
    const avgHR = (filtered.reduce((sum, d) => sum + d.hr, 0) / filtered.length).toFixed(1);
    const avgTemp = (filtered.reduce((sum, d) => sum + d.temp, 0) / filtered.length).toFixed(1);
    const avgSpO2 = (filtered.reduce((sum, d) => sum + d.spo2, 0) / filtered.length).toFixed(1);
    
    return {
      avgHR,
      avgTemp,
      avgSpO2,
      minHR: Math.min(...filtered.map((d) => d.hr)),
      maxHR: Math.max(...filtered.map((d) => d.hr)),
      totalReadings: filtered.length,
      devices: devices.length,
      hrTrend: previous ? (((latest.hr - previous.hr) / previous.hr) * 100).toFixed(1) : 0,
      tempTrend: previous ? (((latest.temp - previous.temp) / previous.temp) * 100).toFixed(1) : 0,
      spo2Trend: previous ? (((latest.spo2 - previous.spo2) / previous.spo2) * 100).toFixed(1) : 0,
    };
  }, [filtered]);

  // Optimized data fetching with useCallback - user-specific
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Supabase client is initialized
      if (!supabase) {
        console.error('❌ Analytics: Supabase client not initialized');
        setError('Connection error. Please refresh the page.');
        setLoading(false);
        return;
      }

      console.log('🔌 Analytics: Supabase client ready');
      
      // Get user (this should be fast, no timeout needed)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Analytics: Auth error:', userError);
        setError('Authentication error. Please login again.');
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.log('❌ Analytics: No user found');
        setLoading(false);
        setError('Not authenticated. Please login again.');
        return;
      }
      
      console.log('✅ Analytics: User authenticated:', user.id, user.email);
      
      const now = new Date();
      const startTime = new Date(now.getTime() - TIME_RANGES[timeRange]);
      
      console.log('📅 Analytics: Time range:', timeRange, 'Start:', startTime.toISOString());
      console.log('🔍 Analytics: Querying wristband_data...');
      
      // Create timeout promise (15 seconds for slow connections)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 15000);
      });
      
      // Query with timeout
      const queryPromise = supabase
        .from("wristband_data")
        .select("device_id, hr, temp, spo2, bp_sys, bp_dia, created_at")
        .eq('user_id', user.id)
        .gte("created_at", startTime.toISOString())
        .order("created_at", { ascending: true });
      
      const { data: rawData, error: queryError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]).catch(err => {
        if (err.message === 'Request timed out') {
          throw err;
        }
        return { data: null, error: err };
      });
      
      console.log('📊 Analytics: Query completed:', {
        error: queryError ? queryError.message : 'none',
        rowCount: rawData ? rawData.length : 0,
        deviceFilter: deviceFilter
      });
        
      if (queryError) {
        console.error('❌ Analytics: Database error:', queryError);
        setError(`Database error: ${queryError.message}`);
      } else if (rawData) {
        console.log('✅ Analytics: Data received:', rawData.length, 'records');
        
        if (rawData.length > 0) {
          console.log('📋 Analytics: Sample data:', rawData.slice(0, 2));
        } else {
          console.warn('⚠️ Analytics: No data found for user_id:', user.id);
          console.log('💡 Analytics: Check if data exists with correct user_id in database');
        }
        
        setData(rawData);
        const filteredData = deviceFilter === "ALL"
          ? rawData
          : rawData.filter((d) => d.device_id === deviceFilter);
        console.log('🔍 Analytics: After device filter:', filteredData.length, 'records');
        setFiltered(filteredData);
      }
    } catch (error) {
      console.error('❌ Analytics: Fatal error:', error);
      if (error.message === 'Request timed out') {
        setError('Connection timeout after 15 seconds. Check your internet connection or Supabase project status.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange, deviceFilter, supabase]);

  useEffect(() => {
    console.log('🔄 Analytics: useEffect triggered, fetching data...');
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Memoized chart data formatting
  const chartData = useMemo(() => {
    return filtered.map((d) => ({
      time: new Date(d.created_at).toLocaleTimeString(),
      hr: d.hr,
      temp: d.temp,
      spo2: d.spo2,
      bp_sys: d.bp_sys,
      bp_dia: d.bp_dia,
      device: d.device_id,
    }));
  }, [filtered]);

  // Memoized HR distribution
  const hrDistribution = useMemo(() => {
    const buckets = [50, 60, 70, 80, 90, 100, 110, 120];
    const counts = buckets.map((upper, i) => {
      const lower = i === 0 ? 0 : buckets[i - 1];
      const inBucket = filtered.filter((d) => d.hr >= lower && d.hr < upper);
      return { range: `${lower}-${upper - 1}`, count: inBucket.length };
    });
    const over = filtered.filter((d) => d.hr >= buckets[buckets.length - 1]);
    counts.push({ range: `${buckets[buckets.length - 1]}+`, count: over.length });
    return counts;
  }, [filtered]);

  // Memoized device list
  const deviceList = useMemo(() => {
    return [...new Set(data.map(d => d.device_id))];
  }, [data]);

  // Optimized filter handler
  const handleDeviceFilterChange = useCallback((val) => {
    setDeviceFilter(val);
    const filteredData = val === 'ALL' ? data : data.filter(d => d.device_id === val);
    setFiltered(filteredData);
  }, [data]);

  // Optimized CSV export
  const exportCSV = useCallback(() => {
    if (filtered.length === 0) return;
    const header = ["device_id", "hr", "temp", "spo2", "bp_sys", "bp_dia", "created_at"];
    const rows = filtered.map((d) => header.map((h) => d[h]).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wristband_data_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {loading ? (
        <div className="text-center py-28">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-black font-medium text-lg">Loading analytics data...</p>
          <p className="text-black text-sm">Please wait a moment.</p>
          <p className="text-gray-500 text-xs mt-4">If this takes too long, check the browser console (F12)</p>
        </div>
      ) : error ? (
        <div className="text-center py-28 bg-red-50 rounded-3xl shadow-xl border border-red-200">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-8">
            <Activity className="w-12 h-12 text-red-900" />
          </div>
          <h3 className="text-2xl font-bold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700 max-w-md mx-auto mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => fetchData()} className="mt-6" variant="default">
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button className="mt-6" variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
          <p className="text-gray-500 text-xs mt-6">Check browser console (F12) for more details</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-28 bg-white rounded-3xl shadow-xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full mb-8">
            <BarChart3 className="w-12 h-12 text-blue-900" />
          </div>
          <h3 className="text-2xl font-bold text-black mb-2">No Data Available</h3>
          <p className="text-black max-w-md mx-auto">Start collecting wristband data to see analytics. Ensure your time range and device filters are correct.</p>
          <Link href="/dashboard">
            <Button className="mt-6" variant="default">Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-black">Analytics Dashboard</h2>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Time Range Selector */}
              <div className="flex gap-1 bg-white rounded-xl p-1 shadow-md border border-gray-200">
                {["1h", "6h", "24h", "7d"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-black hover:bg-gray-100'
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
              {/* Device Filter */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 shadow-md border border-gray-200">
                <Filter className="w-4 h-4 text-gray-900" />
                <select
                  value={deviceFilter}
                  onChange={(e) => handleDeviceFilterChange(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-black font-medium"
                >
                  <option value="ALL">All Devices</option>
                  {deviceList.map(dev => (
                    <option key={dev} value={dev}>{dev}</option>
                  ))}
                </select>
              </div>
              {/* Export Button */}
              <Button
                onClick={exportCSV}
                disabled={filtered.length === 0}
                variant="success"
                size="sm"
                className="shadow-md"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">
                  <Activity className="w-4 h-4" />
                  Live
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Average Heart Rate"
              value={stats.avgHR}
              unit="BPM"
              icon={Heart}
              trend={stats.hrTrend}
              color="from-red-50 to-pink-50"
              iconColor="text-red-900"
            />
            <StatCard
              title="Average Temperature"
              value={stats.avgTemp}
              unit="°C"
              icon={Thermometer}
              trend={stats.tempTrend}
              color="from-orange-50 to-amber-50"
              iconColor="text-orange-900"
            />
            <StatCard
              title="Average SpO2"
              value={stats.avgSpO2}
              unit="%"
              icon={Droplet}
              trend={stats.spo2Trend}
              color="from-blue-50 to-cyan-50"
              iconColor="text-blue-900"
            />
            <StatCard
              title="Total Readings"
              value={stats.totalReadings}
              unit="records"
              icon={Activity}
              color="from-purple-50 to-indigo-50"
              iconColor="text-purple-900"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Heart Rate Chart */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl hover:border-red-200/50 transition-all duration-500 hover:-translate-y-1 transform">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full group-hover:scale-110 transition-transform duration-300"><Heart className="w-6 h-6 text-red-700" /></div>
                Heart Rate Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} domain={[50, 120]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 8 }} name="Heart Rate (BPM)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Temperature Chart */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl hover:border-orange-200/50 transition-all duration-500 hover:-translate-y-1 transform">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full"><Thermometer className="w-6 h-6 text-orange-700" /></div>
                Temperature Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} domain={[35, 39]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="temp" stroke="#f97316" fill="url(#colorTemp)" strokeWidth={2.5} name="Temperature (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Oxygen Chart */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl hover:border-blue-200/50 transition-all duration-500 hover:-translate-y-1 transform">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full"><Droplet className="w-6 h-6 text-blue-700" /></div>
                Blood Oxygen (SpO2)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} domain={[90, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <defs>
                    <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="spo2" stroke="#3b82f6" fill="url(#colorSpo2)" strokeWidth={2.5} name="SpO2 (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Blood Pressure Chart */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl hover:border-purple-200/50 transition-all duration-500 hover:-translate-y-1 transform">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full"><Activity className="w-6 h-6 text-purple-700" /></div>
                Blood Pressure
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} domain={[50, 150]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="bp_sys" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 8 }} name="Systolic" />
                  <Line type="monotone" dataKey="bp_dia" stroke="#c084fc" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heart Rate Distribution */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-100/50 hover:shadow-2xl transition-all duration-500">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-900" />
              Heart Rate Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hrDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="range" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" name="Readings" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-black mt-4">Buckets grouped in 10 BPM ranges. Higher distributions may indicate stress or activity periods.</p>
          </div>

          {/* Summary Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-blue-100/50 hover:shadow-2xl transition-all duration-500">
            <h3 className="text-xl font-bold text-black mb-6">Summary Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-black mb-1">Active Devices</p>
                <p className="text-2xl font-bold text-blue-600">{stats.devices}</p>
              </div>
              <div>
                <p className="text-sm text-black mb-1">HR Range</p>
                <p className="text-2xl font-bold text-black">{stats.minHR} - {stats.maxHR}</p>
              </div>
              <div>
                <p className="text-sm text-black mb-1">Time Period</p>
                <p className="text-2xl font-bold text-black">{timeRange.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-black mb-1">Data Points</p>
                <p className="text-2xl font-bold text-black">{stats.totalReadings}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
