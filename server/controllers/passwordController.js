const { z } = require("zod");
const PasswordEntry = require("../models/PasswordEntry");
const { encryptString, decryptToString } = require("../utils/crypto");
const { scorePassword, labelForScore } = require("../utils/passwordHealth");
const { buildDecoyItems } = require("../utils/decoyVault");
const { computeAccountRisk, riskLabel } = require("../utils/riskPrediction");
const { estimatedEntropyBits, detectPatterns, advisorSuggestions } = require("../utils/passwordEntropy");
const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");
const { grantAchievement } = require("../utils/engagement");

const addSchema = z.object({
  siteName: z.string().min(1).max(120),
  siteUrl: z.string().max(500).optional().or(z.literal("")),
  username: z.string().min(1).max(120),
  password: z.string().min(1).max(500),
  notes: z.string().max(5000).optional().or(z.literal("")),
});

async function addPassword(req, res) {
  if (req.decoySession) {
    return res.status(201).json({ id: `decoy-${Date.now()}`, fake: true });
  }

  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { siteName, siteUrl, username, password, notes } = parsed.data;
  const passwordEnc = encryptString(password);
  const notesEnc = notes ? encryptString(notes) : undefined;

  const priorCount = await PasswordEntry.countDocuments({ user: req.user._id });

  const entry = await PasswordEntry.create({
    user: req.user._id,
    siteName,
    siteUrl: siteUrl || "",
    username,
    passwordEnc,
    notesEnc,
  });

  const user = await User.findById(req.user._id);
  if (user) {
    grantAchievement(user, "vault_entry");
    if (priorCount === 0) grantAchievement(user, "first_credential");
    if (scorePassword(password) >= 80) grantAchievement(user, "strong_password");
    await user.save();
  }

  res.status(201).json({ id: entry._id });
}

async function getPasswords(req, res) {
  if (req.decoySession) {
    const items = buildDecoyItems();
    return res.json({
      items,
      fake: true,
      alerts: [],
      riskSummary: {
        riskPercent: 18,
        label: riskLabel(18),
        threatLevel: "green",
      },
    });
  }

  const entries = await PasswordEntry.find({ user: req.user._id }).sort({ createdAt: -1 });

  const decrypted = entries.map((e) => {
    const pw = decryptToString(e.passwordEnc);
    const notes = e.notesEnc ? decryptToString(e.notesEnc) : "";
    const score = scorePassword(pw);
    const patterns = detectPatterns(pw);
    return {
      id: e._id,
      siteName: e.siteName,
      siteUrl: e.siteUrl || "",
      username: e.username,
      password: pw,
      notes,
      health: { score, label: labelForScore(score) },
      intelligence: {
        entropyBits: Math.round(estimatedEntropyBits(pw)),
        patterns,
        advisor: advisorSuggestions(pw, score),
      },
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  });

  // Reuse detection (client can also do this, but returning a hint is useful)
  const counts = new Map();
  for (const item of decrypted) counts.set(item.password, (counts.get(item.password) || 0) + 1);
  const withReuse = decrypted.map((item) => ({
    ...item,
    reused: (counts.get(item.password) || 0) > 1,
  }));

  const alerts = [];
  const weakCount = withReuse.filter((i) => (i.health?.score || 0) < 55).length;
  const reusedCount = withReuse.filter((i) => i.reused).length;
  if (weakCount > 0) {
    alerts.push({
      type: "weak_password",
      count: weakCount,
      message: `${weakCount} password(s) look weak. Consider updating them.`,
    });
  }
  if (reusedCount > 0) {
    alerts.push({
      type: "reused_password",
      count: reusedCount,
      message: `${reusedCount} password(s) appear reused across entries.`,
    });
  }

  const n = withReuse.length;
  const avgHealth = n ? Math.round(withReuse.reduce((a, x) => a + (x.health?.score || 0), 0) / n) : 0;
  const lastSuspicious = await LoginActivity.findOne({
    userId: req.user._id,
    suspicious: true,
  })
    .sort({ timestamp: -1 })
    .lean();

  const riskPercent = computeAccountRisk({
    avgHealth,
    weakCount,
    reusedCount,
    entryCount: n,
    suspiciousLoginFlag: !!lastSuspicious,
  });
  const rl = riskLabel(riskPercent);
  const threatLevel = rl.color === "red" ? "red" : rl.color === "yellow" ? "yellow" : "green";

  res.json({
    items: withReuse,
    alerts,
    riskSummary: {
      riskPercent,
      label: rl,
      threatLevel,
      behaviorRisk: lastSuspicious ? "elevated" : "normal",
    },
  });
}

async function deletePassword(req, res) {
  if (req.decoySession) {
    return res.json({ ok: true, fake: true });
  }

  const id = req.params.id;
  const entry = await PasswordEntry.findOne({ _id: id, user: req.user._id });
  if (!entry) return res.status(404).json({ message: "Not found" });

  await entry.deleteOne();
  res.json({ ok: true });
}

module.exports = { addPassword, getPasswords, deletePassword };

