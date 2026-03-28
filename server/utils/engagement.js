function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUtc() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function ensureEngagement(user) {
  if (!user.engagement) user.engagement = {};
  if (user.engagement.streakCount == null) user.engagement.streakCount = 0;
  if (!Array.isArray(user.engagement.achievements)) user.engagement.achievements = [];
  if (!Array.isArray(user.engagement.completedChallengeIds)) user.engagement.completedChallengeIds = [];
}

function updateStreak(user) {
  ensureEngagement(user);
  const today = todayUtc();
  const last = user.engagement.lastStreakDate || '';
  if (last === today) return;

  const y = yesterdayUtc();
  if (!last) {
    user.engagement.streakCount = 1;
  } else if (last === y) {
    user.engagement.streakCount = (user.engagement.streakCount || 0) + 1;
  } else {
    user.engagement.streakCount = 1;
  }
  user.engagement.lastStreakDate = today;
}

function grantAchievement(user, id) {
  ensureEngagement(user);
  if (!user.engagement.achievements.includes(id)) {
    user.engagement.achievements.push(id);
  }
}

const DAILY_CHALLENGES = [
  { id: 'check-weak', title: 'Review one weak password in your vault' },
  { id: 'phishing-check', title: 'Paste a real URL into phishing check before copying' },
  { id: 'export-backup', title: 'Download an encrypted vault backup' },
  { id: 'rotate-reused', title: 'Identify a reused password and plan a rotation' },
];

function dailyChallengeForDate(todayUtcStr) {
  const d = new Date(`${todayUtcStr}T12:00:00Z`).getTime();
  const idx = Math.abs(Math.floor(d / 86400000)) % DAILY_CHALLENGES.length;
  return { ...DAILY_CHALLENGES[idx], day: todayUtcStr };
}

module.exports = {
  todayUtc,
  ensureEngagement,
  updateStreak,
  grantAchievement,
  dailyChallengeForDate,
  DAILY_CHALLENGES,
};
