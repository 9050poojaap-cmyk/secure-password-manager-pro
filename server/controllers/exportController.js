const PasswordEntry = require("../models/PasswordEntry");
const LoginActivity = require("../models/LoginActivity");
const { encryptString } = require("../utils/crypto");
const { buildDecoyItems } = require("../utils/decoyVault");
const { decryptToString } = require("../utils/crypto");
const { scorePassword } = require("../utils/passwordHealth");
const { computeAccountRisk, riskLabel } = require("../utils/riskPrediction");
const { randomStrongPassword } = require("../utils/passwordEntropy");

async function buildAnalyticsBundle(userId) {
  const entries = await PasswordEntry.find({ user: userId }).lean();
  let totalScore = 0;
  let weak = 0;
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
  const reused = [...counts.values()].filter((c) => c > 1).length;
  const n = entries.length;
  const avgHealth = n ? Math.round(totalScore / n) : 0;
  const lastSuspicious = await LoginActivity.findOne({ userId, suspicious: true }).sort({ timestamp: -1 }).lean();
  const riskPercent = computeAccountRisk({
    avgHealth,
    weakCount: weak,
    reusedCount: reused,
    entryCount: n,
    suspiciousLoginFlag: !!lastSuspicious,
  });
  return {
    summary: {
      entryCount: n,
      avgHealth,
      weakCount: weak,
      reusedClusters: reused,
    },
    riskReport: {
      riskPercent,
      label: riskLabel(riskPercent),
      lastSuspiciousAt: lastSuspicious?.timestamp || null,
    },
  };
}

async function exportVault(req, res) {
  if (req.decoySession) {
    const decoyPayload = JSON.stringify({
      version: 1,
      fake: true,
      items: buildDecoyItems(),
      analytics: { summary: { entryCount: 3, avgHealth: 76, weakCount: 0, reusedClusters: 1 } },
      riskReport: { riskPercent: 22, label: riskLabel(22) },
    });
    const enc = encryptString(decoyPayload);
    return res.json({
      encrypted: true,
      iv: enc.iv,
      tag: enc.tag,
      data: enc.data,
      exportedAt: new Date().toISOString(),
      fake: true,
    });
  }

  const entries = await PasswordEntry.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  const vault = entries.map((e) => ({
    siteName: e.siteName,
    siteUrl: e.siteUrl || "",
    username: e.username,
    passwordEnc: e.passwordEnc,
    notesEnc: e.notesEnc || null,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  }));

  const bundle = await buildAnalyticsBundle(req.user._id);
  const payload = JSON.stringify({ version: 1, vault, analytics: bundle.summary, riskReport: bundle.riskReport });
  const enc = encryptString(payload);
  res.json({
    encrypted: true,
    iv: enc.iv,
    tag: enc.tag,
    data: enc.data,
    exportedAt: new Date().toISOString(),
  });
}

function generatePassword(req, res) {
  if (req.decoySession) {
    return res.json({ password: randomStrongPassword(16), fake: true });
  }
  res.json({ password: randomStrongPassword(22) });
}

module.exports = { exportVault, generatePassword };
