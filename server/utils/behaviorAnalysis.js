/**
 * Lightweight typing-pattern analysis (simulated biometrics).
 * Expects keystrokeData: [{ t: number, type: 'down'|'up', key?: string }]
 */

function statsFromFlights(flights) {
  if (!flights.length) return { avgIntervalMs: 0, variance: 0, count: 0 };
  const sum = flights.reduce((a, b) => a + b, 0);
  const avg = sum / flights.length;
  const varSum = flights.reduce((a, f) => a + (f - avg) ** 2, 0);
  const variance = flights.length > 1 ? varSum / (flights.length - 1) : 0;
  return { avgIntervalMs: avg, variance, count: flights.length };
}

function extractFlights(keystrokeData) {
  if (!Array.isArray(keystrokeData) || keystrokeData.length < 2) return [];
  const downs = keystrokeData.filter((e) => e && e.type === "down" && typeof e.t === "number").sort((a, b) => a.t - b.t);
  const flights = [];
  for (let i = 1; i < downs.length; i += 1) {
    const delta = downs[i].t - downs[i - 1].t;
    if (delta > 0 && delta < 5000) flights.push(delta);
  }
  return flights;
}

function extractDwellStats(keystrokeData) {
  const map = new Map();
  for (const e of keystrokeData || []) {
    if (!e || typeof e.t !== "number") continue;
    if (e.type === "down") {
      map.set(`${e.key || "?"}-${e.t}`, { down: e.t });
    }
    if (e.type === "up" && e.key) {
      for (const [k, v] of map.entries()) {
        if (k.startsWith(`${e.key}-`) && v.down != null && !v.up) {
          v.up = e.t;
          v.dwell = e.t - v.down;
          break;
        }
      }
    }
  }
  const dwells = [...map.values()].map((v) => v.dwell).filter((d) => typeof d === "number" && d > 0 && d < 2000);
  return statsFromFlights(dwells);
}

function analyzeSample(keystrokeData) {
  const flights = extractFlights(keystrokeData);
  const flightStats = statsFromFlights(flights);
  const dwellStats = extractDwellStats(keystrokeData);
  return { flightStats, dwellStats };
}

function mergeBaseline(prev, sample) {
  const f = sample.flightStats;
  if (!f.count) return prev;

  if (!prev || !prev.sampleCount) {
    return {
      avgFlightMs: f.avgIntervalMs,
      flightVariance: f.variance,
      avgDwellMs: sample.dwellStats.avgIntervalMs,
      dwellVariance: sample.dwellStats.variance,
      sampleCount: 1,
    };
  }

  const n = prev.sampleCount + 1;
  const avgFlightMs = (prev.avgFlightMs * prev.sampleCount + f.avgIntervalMs) / n;
  const flightVariance = (prev.flightVariance * prev.sampleCount + f.variance) / n;
  const avgDwellMs =
    sample.dwellStats.count > 0
      ? ((prev.avgDwellMs || 0) * prev.sampleCount + sample.dwellStats.avgIntervalMs) / (prev.sampleCount + 1)
      : prev.avgDwellMs;
  return {
    avgFlightMs,
    flightVariance,
    avgDwellMs,
    dwellVariance: prev.dwellVariance,
    sampleCount: n,
  };
}

function isSuspicious(baseline, sample) {
  if (!baseline || baseline.sampleCount < 1) return false;
  const f = sample.flightStats;
  if (f.count < 2) return false;

  const flightDiff = Math.abs(f.avgIntervalMs - baseline.avgFlightMs);
  const flightThreshold = Math.max(120, (baseline.flightVariance || 50) * 2.5);
  const varSpike = f.variance > (baseline.flightVariance || 50) * 4;

  let dwellBad = false;
  if (sample.dwellStats.count >= 2 && baseline.avgDwellMs) {
    const dDiff = Math.abs(sample.dwellStats.avgIntervalMs - baseline.avgDwellMs);
    dwellBad = dDiff > Math.max(80, (baseline.dwellVariance || 40) * 2);
  }

  return flightDiff > flightThreshold || varSpike || dwellBad;
}

module.exports = {
  analyzeSample,
  mergeBaseline,
  isSuspicious,
};
