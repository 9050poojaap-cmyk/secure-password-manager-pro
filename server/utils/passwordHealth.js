const COMMON_BAD = ["password", "123456", "qwerty", "letmein", "admin", "welcome"];

function scorePassword(pw) {
  if (!pw) return 0;
  const s = pw.toLowerCase();
  let score = 0;

  if (pw.length >= 8) score += 15;
  if (pw.length >= 12) score += 20;
  if (pw.length >= 16) score += 10;

  if (/[a-z]/.test(pw)) score += 10;
  if (/[A-Z]/.test(pw)) score += 10;
  if (/\d/.test(pw)) score += 10;
  if (/[^A-Za-z0-9]/.test(pw)) score += 15;

  if (/(\w)\1\1/.test(pw)) score -= 15;
  if (/1234|abcd|qwer|asdf/i.test(pw)) score -= 20;
  if (COMMON_BAD.some((w) => s.includes(w))) score -= 40;

  score = Math.max(0, Math.min(100, score));
  return score;
}

function labelForScore(score) {
  if (score >= 80) return "Strong";
  if (score >= 55) return "Okay";
  if (score >= 35) return "Weak";
  return "Very weak";
}

module.exports = { scorePassword, labelForScore };

