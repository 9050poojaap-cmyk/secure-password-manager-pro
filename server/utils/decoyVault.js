const { scorePassword, labelForScore } = require("./passwordHealth");

function buildDecoyItems(email) {
  const mask = email ? `${String(email).slice(0, 2)}***` : "user***";
  const items = [
    {
      id: "decoy-1",
      siteName: "Corporate SSO",
      siteUrl: "https://login.company.example",
      username: mask,
      password: "K9#mP2$vLx!qR7",
      notes: "Internal portal (simulated)",
      health: { score: 88, label: labelForScore(88) },
      reused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "decoy-2",
      siteName: "Cloud Console",
      siteUrl: "https://console.cloud.example",
      username: "admin@team.local",
      password: "Zebra!42-secure",
      notes: "",
      health: { score: 72, label: labelForScore(72) },
      reused: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "decoy-3",
      siteName: "Banking",
      siteUrl: "https://secure.bank.example",
      username: "primary",
      password: "password123",
      notes: "Demo only",
      health: { score: scorePassword("password123"), label: labelForScore(scorePassword("password123")) },
      reused: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  return items;
}

module.exports = { buildDecoyItems };
