const { z } = require("zod");
const PasswordEntry = require("../models/PasswordEntry");
const ShareToken = require("../models/ShareToken");
const { decryptToString, sha256Hex, randomToken } = require("../utils/crypto");

const createSchema = z.object({
  passwordEntryId: z.string().min(1),
  expiresInMinutes: z.number().int().min(1).max(60 * 24).optional(),
  oneTime: z.boolean().optional(),
});

async function createShare(req, res) {
  if (req.decoySession) {
    const { randomToken } = require("../utils/crypto");
    return res.json({
      token: randomToken(28),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      oneTime: true,
      fake: true,
    });
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const { passwordEntryId, expiresInMinutes = 30, oneTime = true } = parsed.data;
  const entry = await PasswordEntry.findOne({ _id: passwordEntryId, user: req.user._id });
  if (!entry) return res.status(404).json({ message: "Not found" });

  const token = randomToken(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await ShareToken.create({
    tokenHash,
    passwordEntry: entry._id,
    createdBy: req.user._id,
    expiresAt,
    oneTime,
  });

  res.json({
    token,
    expiresAt,
    oneTime,
  });
}

async function redeemShare(req, res) {
  const token = req.params.token;
  if (!token) return res.status(400).json({ message: "Missing token" });

  const tokenHash = sha256Hex(token);
  const share = await ShareToken.findOne({ tokenHash }).populate("passwordEntry");
  if (!share) return res.status(404).json({ message: "Invalid or expired token" });

  if (share.expiresAt.getTime() <= Date.now()) {
    await share.deleteOne().catch(() => {});
    return res.status(404).json({ message: "Invalid or expired token" });
  }

  if (share.oneTime && share.usedAt) {
    return res.status(410).json({ message: "Token already used" });
  }

  const entry = share.passwordEntry;
  if (!entry) return res.status(404).json({ message: "Not found" });

  const password = decryptToString(entry.passwordEnc);
  const notes = entry.notesEnc ? decryptToString(entry.notesEnc) : "";

  if (share.oneTime) {
    share.usedAt = new Date();
    await share.save();
  }

  res.json({
    siteName: entry.siteName,
    siteUrl: entry.siteUrl || "",
    username: entry.username,
    password,
    notes,
    redeemedAt: share.usedAt,
  });
}

module.exports = { createShare, redeemShare };

