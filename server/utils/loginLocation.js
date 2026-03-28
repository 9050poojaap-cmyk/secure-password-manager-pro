/**
 * Simulated location key from client hint + IP (no external geo API).
 */
function getClientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  if (req.ip) return String(req.ip);
  return "0.0.0.0";
}

function getLocationKey(req, body = {}) {
  const region =
    (typeof body.clientRegion === "string" && body.clientRegion.trim()) ||
    (typeof req.headers["x-client-region"] === "string" && req.headers["x-client-region"].trim()) ||
    "unknown-region";
  const ip = getClientIp(req);
  return `${region}::${ip}`;
}

module.exports = { getLocationKey, getClientIp };
