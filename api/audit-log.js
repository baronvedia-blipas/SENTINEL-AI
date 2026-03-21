const { getRecentAuditLog } = require("./lib/avalancheService.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const count = parseInt(req.query.count) || 10;
    const entries = await getRecentAuditLog(count);
    res.json({ entries, count: entries.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
