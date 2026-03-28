const crypto = require('crypto');

function charsetSize(pw) {
  let size = 0;
  if (/[a-z]/.test(pw)) size += 26;
  if (/[A-Z]/.test(pw)) size += 26;
  if (/\d/.test(pw)) size += 10;
  if (/[^A-Za-z0-9]/.test(pw)) size += 33;
  return size || 1;
}

function shannonEntropyBits(str) {
  const freq = new Map();
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  let H = 0;
  const n = str.length
  for (const c of freq.values()) {
    const p = c / n;
    H -= p * Math.log2(p);
  }
  return H * n;
}

function estimatedEntropyBits(pw) {
  if (!pw) return 0;
  const n = pw.length;
  const cs = charsetSize(pw);
  return n * Math.log2(cs);
}

function detectPatterns(pw) {
  const p = [];
  if (/(.)\1{2,}/.test(pw)) p.push('repeated characters');
  if (/1234|abcd|qwer|asdf|password|admin/i.test(pw)) p.push('common sequences');
  if (/^[a-z]+$/i.test(pw)) p.push('only letters');
  if (/^\d+$/.test(pw)) p.push('only digits');
  return p;
}

function advisorSuggestions(pw, healthScore) {
  const s = [];
  if (!pw) return s;
  if ((healthScore ?? 0) < 55) s.push({ type: 'weak', text: 'Strength looks low — increase length and mix character types.' });
  if (!/[^A-Za-z0-9]/.test(pw)) s.push({ type: 'symbols', text: 'Add symbols to increase search space.' });
  if (detectPatterns(pw).length) s.push({ type: 'patterns', text: `Avoid patterns: ${detectPatterns(pw).join(', ')}.` });
  return s;
}

function randomStrongPassword(length = 20) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*-_=+';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

module.exports = {
  estimatedEntropyBits,
  shannonEntropyBits,
  detectPatterns,
  advisorSuggestions,
  randomStrongPassword,
};
