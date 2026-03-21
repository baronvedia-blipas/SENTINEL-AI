module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    protocol: "x402",
    network: "avalanche-fuji",
    endpoints: [
      { endpoint: "/api/analyze/contract", cost: "0.001", currency: "USDC", description: "Contract Analysis" },
      { endpoint: "/api/analyze/transaction", cost: "0.0005", currency: "USDC", description: "Transaction Analysis" },
      { endpoint: "/api/agent/evaluate", cost: "0.001", currency: "USDC", description: "Agent Guard Evaluation" },
    ],
  });
};
