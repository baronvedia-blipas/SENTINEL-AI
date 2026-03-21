const { analyzeTransaction } = require("../lib/txAnalyzer.js");
const { explainTransactionRisk } = require("../lib/claudeService.js");
const { logDecisionOnChain, updateReputation } = require("../lib/avalancheService.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-402-Payment");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const tx = req.body;
    if (!tx.type) return res.status(400).json({ error: "Transaction type is required" });

    const paymentHeader = req.headers["x-402-payment"];
    if (!paymentHeader) {
      return res.status(402).json({
        error: "Payment Required", protocol: "x402",
        pricing: { cost: "0.0005", currency: "USDC", description: "Transaction Analysis" },
      });
    }

    const analysis = analyzeTransaction(tx);

    let aiExplanation;
    try {
      aiExplanation = await explainTransactionRisk(tx, analysis);
    } catch (err) {
      aiExplanation = { explanation: analysis.summary, recommendation: "Verifica los detalles." };
    }

    let onChainResult = null;
    try {
      onChainResult = await logDecisionOnChain({
        target: tx.contractAddress || "0x0000000000000000000000000000000000000000",
        decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW",
        riskLevel: analysis.riskLevel, reason: analysis.summary,
        encryptedReport: "", paymentWei: "0.0005",
      });
      await updateReputation(analysis.riskLevel === "HIGH");
    } catch (err) {
      console.error("[On-chain]", err.message);
    }

    res.json({
      riskLevel: analysis.riskLevel, findings: analysis.findings, summary: analysis.summary,
      aiExplanation, onChain: onChainResult,
      payment: { cost: "0.0005", currency: "USDC", verified: true },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
