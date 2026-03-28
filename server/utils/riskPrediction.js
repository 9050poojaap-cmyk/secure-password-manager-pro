/**
 * Heuristic account risk 0–100 from vault aggregates.
 */
function computeAccountRisk({ avgHealth, weakCount, reusedCount, entryCount, suspiciousLoginFlag }) {
  let risk = 0;
  if (entryCount === 0) risk += 15;
  else {
    risk += Math.max(0, 100 - (avgHealth || 0)) * 0.35;
    risk += Math.min(40, weakCount * 12);
    risk += Math.min(35, reusedCount * 15);
  }
  if (suspiciousLoginFlag) risk += 18;
  return Math.min(100, Math.round(risk));
}

function riskLabel(risk) {
  if (risk >= 66) return { level: 'high', color: 'red' };
  if (risk >= 38) return { level: 'medium', color: 'yellow' };
  return { level: 'safe', color: 'green' };
}

module.exports = { computeAccountRisk, riskLabel };
