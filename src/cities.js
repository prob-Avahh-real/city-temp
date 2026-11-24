/** Preset cities with known coordinates (Open-Meteo). */
export const PRESET_CITIES = [
  { name: '北京', lat: 39.9042, lon: 116.4074, country: '中国' },
  { name: '上海', lat: 31.2304, lon: 121.4737, country: '中国' },
  { name: '广州', lat: 23.1291, lon: 113.2644, country: '中国' },
  { name: '深圳', lat: 22.5431, lon: 114.0579, country: '中国' },
  { name: '杭州', lat: 30.2741, lon: 120.1551, country: '中国' },
  { name: '成都', lat: 30.5728, lon: 104.0668, country: '中国' },
  { name: '重庆', lat: 29.563, lon: 106.5516, country: '中国' },
  { name: '武汉', lat: 30.5928, lon: 114.3055, country: '中国' },
  { name: '西安', lat: 34.3416, lon: 108.9398, country: '中国' },
  { name: '南京', lat: 32.0603, lon: 118.7969, country: '中国' },
  { name: '天津', lat: 39.3434, lon: 117.3616, country: '中国' },
  { name: '苏州', lat: 31.2989, lon: 120.5853, country: '中国' },
  { name: '香港', lat: 22.3193, lon: 114.1694, country: '中国' },
  { name: '台北', lat: 25.033, lon: 121.5654, country: '中国' },
  { name: '东京', lat: 35.6762, lon: 139.6503, country: '日本' },
  { name: '新加坡', lat: 1.3521, lon: 103.8198, country: '新加坡' },
  { name: '纽约', lat: 40.7128, lon: -74.006, country: '美国' },
  { name: '伦敦', lat: 51.5074, lon: -0.1278, country: '英国' },
];

export function findPreset(name) {
  const q = name.trim().toLowerCase();
  return PRESET_CITIES.find(
    (c) => c.name === name.trim() || c.name.toLowerCase() === q,
  );
}
