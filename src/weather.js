/**
 * Real temperature via Open-Meteo (no API key).
 * https://open-meteo.com/
 */

const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';

/** WMO weather interpretation codes → short Chinese label */
export function weatherLabel(code) {
  const map = {
    0: '晴',
    1: '大部晴朗',
    2: '少云',
    3: '阴',
    45: '雾',
    48: '雾凇',
    51: '小毛毛雨',
    53: '毛毛雨',
    55: '大毛毛雨',
    56: '冻毛毛雨',
    57: '强冻毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '冻雨',
    67: '强冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '阵雨',
    81: '强阵雨',
    82: '暴雨',
    85: '阵雪',
    86: '强阵雪',
    95: '雷暴',
    96: '雷暴伴冰雹',
    99: '强雷暴伴冰雹',
  };
  return map[code] ?? `天气码 ${code}`;
}

/**
 * @param {string} name
 * @returns {Promise<{ name: string, lat: number, lon: number, country: string, admin1?: string }>}
 */
export async function geocodeCity(name) {
  const q = name.trim();
  if (!q) throw new Error('请输入城市名');

  const url = `${GEOCODE}?name=${encodeURIComponent(q)}&count=5&language=zh&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`地理编码失败 (${res.status})`);
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) throw new Error(`未找到城市：${q}`);

  return {
    name: hit.name,
    lat: hit.latitude,
    lon: hit.longitude,
    country: hit.country ?? '',
    admin1: hit.admin1,
  };
}

/**
 * @param {{ lat: number, lon: number, name?: string, country?: string, admin1?: string }} place
 */
export async function fetchCurrentWeather(place) {
  const params = new URLSearchParams({
    latitude: String(place.lat),
    longitude: String(place.lon),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'is_day',
    ].join(','),
    timezone: 'auto',
  });

  const res = await fetch(`${FORECAST}?${params}`);
  if (!res.ok) throw new Error(`气温请求失败 (${res.status})`);
  const data = await res.json();
  const cur = data.current;
  if (!cur || cur.temperature_2m == null) throw new Error('无气温数据');

  return {
    place: {
      name: place.name ?? '',
      country: place.country ?? '',
      admin1: place.admin1,
      lat: place.lat,
      lon: place.lon,
    },
    temperature: cur.temperature_2m,
    feelsLike: cur.apparent_temperature,
    humidity: cur.relative_humidity_2m,
    windSpeed: cur.wind_speed_10m,
    weatherCode: cur.weather_code,
    weatherText: weatherLabel(cur.weather_code),
    isDay: cur.is_day === 1,
    observedAt: cur.time,
    timezone: data.timezone,
    units: data.current_units,
  };
}

/**
 * Resolve city by name (preset coords or geocode) then fetch weather.
 * @param {string} name
 * @param {{ resolve?: (name: string) => { name: string, lat: number, lon: number, country?: string } | null }} [opts]
 */
export async function fetchCityTemp(name, opts = {}) {
  let place = opts.resolve?.(name) ?? null;
  if (!place) place = await geocodeCity(name);
  return fetchCurrentWeather(place);
}
