import test from 'node:test';
import assert from 'node:assert/strict';
import { weatherLabel, fetchCityTemp } from '../src/weather.js';
import { findPreset, PRESET_CITIES } from '../src/cities.js';

test('weatherLabel maps clear sky', () => {
  assert.equal(weatherLabel(0), '晴');
  assert.equal(weatherLabel(61), '小雨');
});

test('findPreset resolves Beijing', () => {
  const c = findPreset('北京');
  assert.ok(c);
  assert.equal(c.lat, 39.9042);
});

test('PRESET_CITIES has major Chinese cities', () => {
  assert.ok(PRESET_CITIES.length >= 10);
  assert.ok(PRESET_CITIES.some((c) => c.name === '上海'));
});

test('fetchCityTemp returns real temperature for Beijing', async () => {
  const result = await fetchCityTemp('北京', { resolve: findPreset });
  assert.equal(result.place.name, '北京');
  assert.ok(Number.isFinite(result.temperature));
  assert.ok(result.temperature > -50 && result.temperature < 60);
  assert.ok(result.weatherText);
});
