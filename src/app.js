import { PRESET_CITIES, findPreset } from './cities.js';
import { fetchCityTemp, fetchCurrentWeather } from './weather.js';

const $ = (sel) => document.querySelector(sel);

const cityInput = $('#city');
const queryBtn = $('#query');
const locateBtn = $('#locate');
const statusEl = $('#status');
const chipsEl = $('#chips');
const tempEl = $('#temp');
const unitEl = $('#unit');
const placeEl = $('#place');
const conditionEl = $('#condition');
const feelsEl = $('#feels');
const humidityEl = $('#humidity');
const windEl = $('#wind');
const timeEl = $('#time');
const heroEl = $('#hero-card');

let cityIndex = 0;
let lastResult = null;
let busy = false;

function setStatus(text, kind = '') {
  statusEl.textContent = text;
  statusEl.dataset.kind = kind;
}

function tempTone(t) {
  if (t == null) return 'neutral';
  if (t <= 0) return 'freeze';
  if (t < 10) return 'cold';
  if (t < 22) return 'mild';
  if (t < 30) return 'warm';
  return 'hot';
}

function formatPlace(place) {
  const parts = [place.name];
  if (place.admin1 && place.admin1 !== place.name) parts.push(place.admin1);
  if (place.country) parts.push(place.country);
  return parts.join(' · ');
}

function renderWeather(result) {
  lastResult = result;
  const t = result.temperature;
  tempEl.textContent = Number.isFinite(t) ? t.toFixed(1) : '--';
  unitEl.textContent = '°C';
  placeEl.textContent = formatPlace(result.place);
  conditionEl.textContent = result.weatherText;
  feelsEl.textContent = `${result.feelsLike?.toFixed(1) ?? '--'}°C`;
  humidityEl.textContent = `${result.humidity ?? '--'}%`;
  windEl.textContent = `${result.windSpeed?.toFixed(1) ?? '--'} km/h`;
  timeEl.textContent = result.observedAt
    ? `观测 ${result.observedAt.replace('T', ' ')} (${result.timezone})`
    : '';
  heroEl.dataset.tone = tempTone(t);
  heroEl.dataset.day = result.isDay ? '1' : '0';
}

function renderChips() {
  chipsEl.innerHTML = '';
  for (const [i, city] of PRESET_CITIES.entries()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = city.name;
    btn.dataset.index = String(i);
    btn.addEventListener('click', () => {
      cityIndex = i;
      cityInput.value = city.name;
      runQuery(city.name);
    });
    chipsEl.appendChild(btn);
  }
}

function highlightChip() {
  for (const el of chipsEl.querySelectorAll('.chip')) {
    el.classList.toggle('active', Number(el.dataset.index) === cityIndex);
  }
}

async function runQuery(name) {
  const q = (name ?? cityInput.value).trim();
  if (!q) {
    setStatus('请输入城市名', 'warn');
    cityInput.focus();
    return;
  }
  if (busy) return;
  busy = true;
  queryBtn.disabled = true;
  locateBtn.disabled = true;
  setStatus('查询真实气温中…', 'busy');

  try {
    const result = await fetchCityTemp(q, { resolve: findPreset });
    const presetIdx = PRESET_CITIES.findIndex((c) => c.name === result.place.name);
    if (presetIdx >= 0) cityIndex = presetIdx;
    cityInput.value = result.place.name;
    renderWeather(result);
    highlightChip();
    setStatus('已更新', 'ok');
  } catch (err) {
    setStatus(err.message ?? '查询失败', 'err');
  } finally {
    busy = false;
    queryBtn.disabled = false;
    locateBtn.disabled = false;
  }
}

async function runLocate() {
  if (busy) return;
  if (!navigator.geolocation) {
    setStatus('设备不支持定位', 'warn');
    return;
  }
  busy = true;
  queryBtn.disabled = true;
  locateBtn.disabled = true;
  setStatus('定位中…', 'busy');

  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      });
    });
    const { latitude: lat, longitude: lon } = pos.coords;
    const result = await fetchCurrentWeather({
      name: '当前位置',
      lat,
      lon,
      country: '',
    });
    cityInput.value = '当前位置';
    renderWeather(result);
    highlightChip();
    setStatus('已定位更新', 'ok');
  } catch (err) {
    const msg =
      err?.code === 1
        ? '定位权限被拒绝'
        : err?.code === 3
          ? '定位超时'
          : err?.message ?? '定位失败';
    setStatus(msg, 'err');
  } finally {
    busy = false;
    queryBtn.disabled = false;
    locateBtn.disabled = false;
  }
}

function shiftCity(delta) {
  cityIndex = (cityIndex + delta + PRESET_CITIES.length) % PRESET_CITIES.length;
  const city = PRESET_CITIES[cityIndex];
  cityInput.value = city.name;
  highlightChip();
  runQuery(city.name);
}

queryBtn.addEventListener('click', () => runQuery());
locateBtn.addEventListener('click', () => runLocate());
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') runQuery();
});

window.onWearableGesture = (name, detail) => {
  if (name === 'shake' || name === 'tap') {
    runQuery(cityInput.value || PRESET_CITIES[cityIndex].name);
    return;
  }
  if (name === 'tilt') {
    if (detail?.dir === 'up' || detail?.dir === 'down') shiftCity(detail.dir === 'up' ? -1 : 1);
    return;
  }
  if (name === 'swing') {
    if (detail?.dir === 'left' || detail?.dir === 'back') shiftCity(-1);
    else shiftCity(1);
  }
};

renderChips();
highlightChip();
cityInput.value = PRESET_CITIES[0].name;
runQuery(PRESET_CITIES[0].name);
