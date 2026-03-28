const { z } = require("zod");
const User = require("../models/User");
const {
  todayUtc,
  ensureEngagement,
  dailyChallengeForDate,
  grantAchievement,
} = require("../utils/engagement");

async function getState(req, res) {
  if (req.decoySession) {
    return res.json({
      streak: 0,
      achievements: [],
      dailyChallenge: dailyChallengeForDate(todayUtc()),
      challengeComplete: false,
      awarenessScore: 0,
    });
  }

  const user = await User.findById(req.user._id).select("engagement");
  ensureEngagement(user);
  const day = todayUtc();
  const daily = dailyChallengeForDate(day);
  const complete =
    user.engagement.lastChallengeDay === day &&
    user.engagement.completedChallengeIds?.includes(daily.id);

  res.json({
    streak: user.engagement.streakCount || 0,
    achievements: user.engagement.achievements || [],
    dailyChallenge: daily,
    challengeComplete: !!complete,
    awarenessScore: user.engagement.awarenessScore || 0,
  });
}

const completeSchema = z.object({ challengeId: z.string().min(1).max(80) });

async function completeChallenge(req, res) {
  if (req.decoySession) return res.json({ ok: true, fake: true });

  const parsed = completeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const user = await User.findById(req.user._id);
  ensureEngagement(user);
  const day = todayUtc();
  const daily = dailyChallengeForDate(day);
  if (parsed.data.challengeId !== daily.id) {
    return res.status(400).json({ message: "Challenge mismatch for today" });
  }

  user.engagement.lastChallengeDay = day;
  if (!user.engagement.completedChallengeIds.includes(daily.id)) {
    user.engagement.completedChallengeIds.push(daily.id);
  }
  grantAchievement(user, "daily_warrior");
  await user.save();

  res.json({ ok: true, streak: user.engagement.streakCount });
}

const quizSchema = z.object({ score: z.number().int().min(0).max(100) });

async function submitAwareness(req, res) {
  if (req.decoySession) return res.json({ ok: true, fake: true });

  const parsed = quizSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const user = await User.findById(req.user._id);
  ensureEngagement(user);
  user.engagement.awarenessScore = Math.max(user.engagement.awarenessScore || 0, parsed.data.score);
  grantAchievement(user, "awareness_champion");
  await user.save();

  res.json({ ok: true, awarenessScore: user.engagement.awarenessScore });
}

module.exports = { getState, completeChallenge, submitAwareness };
