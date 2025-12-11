// Shared constants across the application

export const VITAL_RANGES = {
  hr: { 
    critical: [60, 100], 
    warning: [70, 90],
    min: 30,
    max: 200
  },
  temp: { 
    critical: [36, 37.5], 
    warning: [36.5, 37.2],
    min: 30,
    max: 45
  },
  spo2: { 
    critical: 95, 
    warning: 97,
    min: 70,
    max: 100
  },
  bp: { 
    critical: { sys: [90, 140], dia: [60, 90] },
    warning: { sys: [100, 130], dia: [65, 85] },
    sys: { min: 80, max: 180 },
    dia: { min: 50, max: 110 }
  }
};

export const TIME_RANGES = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

export const REVALIDATE_INTERVAL = 10; // seconds
export const REFRESH_INTERVAL = 30000; // milliseconds

export const CHART_CONFIG = {
  heartRate: {
    color: "#ef4444",
    domain: [50, 120]
  },
  temperature: {
    color: "#f97316",
    domain: [35, 39]
  },
  spo2: {
    color: "#3b82f6",
    domain: [90, 100]
  },
  bloodPressure: {
    systolic: "#8b5cf6",
    diastolic: "#c084fc",
    domain: [50, 150]
  }
};
