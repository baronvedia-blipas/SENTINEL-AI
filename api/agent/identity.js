const { getAgentIdentity } = require("../lib/avalancheService.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const identity = await getAgentIdentity();
    res.json(identity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
