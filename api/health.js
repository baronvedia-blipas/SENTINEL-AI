const { getBalance } = require("./lib/avalancheService.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const balance = await getBalance();
    res.json({
      status: "ok",
      agent: "Sentinel AI",
      network: "Avalanche Fuji",
      balance: `${balance} AVAX`,
      contracts: {
        guard: process.env.SENTINEL_GUARD_ADDRESS,
        erc8004: process.env.SENTINEL_ERC8004_ADDRESS,
      },
    });
  } catch (error) {
    res.json({ status: "ok", agent: "Sentinel AI", error: error.message });
  }
};
