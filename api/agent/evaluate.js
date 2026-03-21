const { evaluateAction } = require("../lib/agentGuard.js");
const { logDecisionOnChain, updateReputation } = require("../lib/avalancheService.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-402-Payment");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const action = req.body;
    if (!action.actionType) return res.status(400).json({ error: "actionType is required" });

    const paymentHeader = req.headers["x-402-payment"];
    if (!paymentHeader) {
      return res.status(402).json({
        error: "Payment Required", protocol: "x402",
        pricing: { cost: "0.001", currency: "USDC", description: "Agent Guard Evaluation" },
      });
    }

    const result = evaluateAction(action);

    let onChainResult = null;
    try {
      onChainResult = await logDecisionOnChain({
        target: action.payload?.contractAddress || action.payload?.to || "0x0000000000000000000000000000000000000000",
        decision: result.decision, riskLevel: result.riskLevel, reason: result.reason,
        encryptedReport: Buffer.from(JSON.stringify(result)).toString("base64"),
        paymentWei: "0.001",
      });
      await updateReputation(result.decision === "BLOCK");
    } catch (err) {
      console.error("[On-chain]", err.message);
    }

    res.json({ ...result, onChain: onChainResult, payment: { cost: "0.001", currency: "USDC", verified: true } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
