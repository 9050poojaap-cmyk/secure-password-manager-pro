const LoginActivity = require("../models/LoginActivity");
const User = require("../models/User");
const PasswordEntry = require("../models/PasswordEntry");
const { decryptToString } = require("../utils/crypto");
const { scorePassword } = require("../utils/passwordHealth");
const { computeAccountRisk, riskLabel } = require("../utils/riskPrediction");

function startOfUtcDay() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

async function community(req, res) {
  const start = startOfUtcDay();
  const suspiciousToday = await LoginActivity.countDocuments({
    suspicious: true,
    timestamp: { $gte: start },
  });
  const loginsToday = await LoginActivity.countDocuments({ timestamp: { $gte: start } });
  const users = await User.countDocuments({});

  const threatsDetected = suspiciousToday + Math.min(500, Math.floor(users * 0.02));

  res.json({
    threatsDetectedToday: threatsDetected,
    loginsToday,
    suspiciousTypingFlags: suspiciousToday,
    registeredUsers: users,
    nationalNarrative:
      "Community telemetry aggregates suspicious typing signals and login anomalies to surface proactive defense insights.",
  });
}

async function riskReport(req, res) {
  if (req.decoySession) {
    return res.json({
      riskPercent: 22,
      label: riskLabel(22),
      summary: "Simulated low-risk profile for decoy session.",
    });
  }

  const entries = await PasswordEntry.find({ user: req.user._id }).lean();
  let totalScore = 0;
  let weak = 0;
  let reused = 0;
  const passwords = [];

  for (const e of entries) {
    const pw = decryptToString(e.passwordEnc);
    passwords.push(pw);
    const sc = scorePassword(pw);
    totalScore += sc;
    if (sc < 55) weak += 1;
  }

  const counts = new Map();
  for (const p of passwords) counts.set(p, (counts.get(p) || 0) + 1);
  reused = [...counts.values()].filter((c) => c > 1).length;

  const n = entries.length;
  const avgHealth = n ? Math.round(totalScore / n) : 0;

  const lastSuspicious = await LoginActivity.findOne({
    userId: req.user._id,
    suspicious: true,
  })
    .sort({ timestamp: -1 })
    .lean();

  const riskPercent = computeAccountRisk({
    avgHealth,
    weakCount: weak,
    reusedCount: reused,
    entryCount: n,
    suspiciousLoginFlag: !!lastSuspicious,
  });

  res.json({
    riskPercent,
    label: riskLabel(riskPercent),
    summary: `Based on ${n} stored entries: average health ${avgHealth}/100, ${weak} weak, ${reused} reuse clusters.`,
    weakCount: weak,
    reusedClusters: reused,
    avgHealth,
  });
}

async function organizationDashboard(req, res) {
  const totalUsers = await User.countDocuments({ role: { $in: ["citizen", "organization"] } });
  const entries = await PasswordEntry.countDocuments({});
  const suspiciousWeek = await LoginActivity.countDocuments({
    suspicious: true,
    timestamp: { $gte: new Date(Date.now() - 7 * 86400000) },
  });

  const weakRatio = entries > 0 ? Math.min(0.35, 0.08 + suspiciousWeek / Math.max(entries, 1)) : 0.12;

  res.json({
    employeePasswordHealthScore: Math.round(100 - weakRatio * 100),
    weakPasswordAlerts: Math.floor(totalUsers * weakRatio * 0.4) + suspiciousWeek,
    loginTrackingSamples: await LoginActivity.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 86400000) },
    }),
    behaviorAnomalies: suspiciousWeek,
    narrative: "Organization view aggregates anonymized workforce hygiene signals (simulated).",
  });
}

async function adminStats(req, res) {
  const start = startOfUtcDay();
  const suspiciousToday = await LoginActivity.countDocuments({
    suspicious: true,
    timestamp: { $gte: start },
  });
  const totalLogins = await LoginActivity.countDocuments({ timestamp: { $gte: start } });
  const totalUsers = await User.countDocuments({});
  const totalEntries = await PasswordEntry.countDocuments({});

  res.json({
    globalThreatSignals: suspiciousToday + Math.floor(totalUsers * 0.03),
    phishingTrendScore: Math.min(100, Math.round(35 + (suspiciousToday / Math.max(totalLogins, 1)) * 100)),
    suspiciousLoginAggregation: suspiciousToday,
    riskOverview: {
      users: totalUsers,
      vaultEntries: totalEntries,
      loginsToday: totalLogins,
    },
    tagline: "National-scale telemetry snapshot (aggregated, simulated mix + live counters).",
  });
}

module.exports = {
  community,
  riskReport,
  organizationDashboard,
  adminStats,
};
