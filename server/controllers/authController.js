const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const User = require("../models/User");
const LoginActivity = require("../models/LoginActivity");
const { analyzeSample, mergeBaseline, isSuspicious } = require("../utils/behaviorAnalysis");
const { getLocationKey, getClientIp } = require("../utils/loginLocation");
const { updateStreak, grantAchievement } = require("../utils/engagement");

function publicUserDoc(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "citizen",
    engagement: user.engagement || {},
  };
}

function applyEnvRoles(user) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const orgEmail = process.env.ORG_EMAIL;
  if (adminEmail && user.email === adminEmail.trim().toLowerCase()) {
    user.role = "admin";
  } else if (orgEmail && user.email === orgEmail.trim().toLowerCase()) {
    user.role = "organization";
  }
}

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

function signDecoyToken() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in environment");
  return jwt.sign({ decoy: true }, secret, { expiresIn: "12h" });
}

const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email().max(120),
  password: z.string().min(8).max(200),
});

const keystrokeEventSchema = z.object({
  t: z.number(),
  type: z.enum(["down", "up"]),
  key: z.string().max(12).optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(1).max(200),
  keystrokeData: z.array(keystrokeEventSchema).max(2000).optional(),
  clientRegion: z.string().max(80).optional(),
});

async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  applyEnvRoles(user);
  await user.save();

  const token = signToken(user._id.toString());
  res.status(201).json({
    token,
    user: publicUserDoc(user),
  });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { email, password, keystrokeData, clientRegion } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const token = signDecoyToken();
    return res.json({
      token,
      user: { id: "decoy", name: "Vault User", email: "user@vault.local", role: "citizen", engagement: {} },
      fake: true,
    });
  }

  const sample = analyzeSample(keystrokeData || []);
  let requiresVerification = false;

  if (sample.flightStats.count >= 2) {
    if (!user.keystrokeBaseline || !user.keystrokeBaseline.sampleCount) {
      user.keystrokeBaseline = mergeBaseline(null, sample);
    } else {
      requiresVerification = isSuspicious(user.keystrokeBaseline, sample);
      if (!requiresVerification) {
        user.keystrokeBaseline = mergeBaseline(user.keystrokeBaseline, sample);
      }
    }
  }

  const bodyForLoc = clientRegion ? { clientRegion } : {};
  const newKey = getLocationKey(req, bodyForLoc);
  let requiresLocationReauth = false;
  if (user.lastLoginLocationKey && user.lastLoginLocationKey !== newKey) {
    requiresLocationReauth = true;
  } else if (!user.lastLoginLocationKey) {
    user.lastLoginLocationKey = newKey;
  }

  if (!requiresLocationReauth) {
    user.lastLoginLocationKey = newKey;
  }

  updateStreak(user);
  applyEnvRoles(user);
  grantAchievement(user, "active_user");
  await user.save();

  const token = signToken(user._id.toString());

  await LoginActivity.create({
    userId: user._id,
    timestamp: new Date(),
    ip: getClientIp(req),
    device: String(req.headers["user-agent"] || "").slice(0, 400),
    suspicious: requiresVerification,
    fakeSession: false,
  });

  const alerts = [];
  if (requiresVerification) {
    alerts.push({
      type: "suspicious_login",
      message: "Typing pattern differs from your baseline. Please re-verify.",
    });
  }
  if (requiresLocationReauth) {
    alerts.push({
      type: "new_location",
      message: "Sign-in from a new simulated location. Re-authentication required for sensitive actions.",
    });
  }

  res.json({
    token,
    user: publicUserDoc(user),
    requiresVerification,
    requiresLocationReauth,
    alerts,
  });
}

async function me(req, res) {
  if (req.decoySession) {
    return res.json({
      user: {
        id: "decoy",
        name: "Vault User",
        email: "user@vault.local",
        role: "citizen",
        engagement: {},
      },
      fake: true,
    });
  }
  const full = await User.findById(req.user._id).select("-passwordHash");
  if (!full) return res.status(401).json({ message: "Not authorized" });
  applyEnvRoles(full);
  await full.save();
  res.json({ user: publicUserDoc(full) });
}

const verifyReauthSchema = z.object({
  password: z.string().min(1).max(200),
  clientRegion: z.string().max(80).optional(),
});

async function verifyReauth(req, res) {
  if (req.decoySession) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const parsed = verifyReauthSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const full = await User.findById(req.user._id);
  if (!full) return res.status(401).json({ message: "Not authorized" });

  const match = await bcrypt.compare(parsed.data.password, full.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const newKey = getLocationKey(req, parsed.data);
  full.lastLoginLocationKey = newKey;
  await full.save();

  res.json({ ok: true });
}

async function loginActivity(req, res) {
  if (req.decoySession) {
    return res.json({ items: [] });
  }

  const rows = await LoginActivity.find({ userId: req.user._id })
    .sort({ timestamp: -1 })
    .limit(5)
    .lean();

  res.json({
    items: rows.map((r) => ({
      id: r._id,
      timestamp: r.timestamp,
      ip: r.ip,
      device: r.device,
      suspicious: r.suspicious,
    })),
  });
}

module.exports = { signup, login, me, verifyReauth, loginActivity };
