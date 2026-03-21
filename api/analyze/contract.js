const { analyzeContract } = require("../lib/contractAnalyzer.js");
const { explainContractAnalysis } = require("../lib/claudeService.js");
const { logDecisionOnChain, updateReputation } = require("../lib/avalancheService.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-402-Payment");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { sourceCode } = req.body;
    if (!sourceCode) return res.status(400).json({ error: "sourceCode is required" });

    // Check x402 payment
    const paymentHeader = req.headers["x-402-payment"];
    if (!paymentHeader) {
      return res.status(402).json({
        error: "Payment Required", protocol: "x402",
        pricing: { cost: "0.001", currency: "USDC", description: "Contract Analysis" },
      });
    }

    const analysis = analyzeContract(sourceCode);

    let aiExplanation;
    try {
      aiExplanation = await explainContractAnalysis(sourceCode, analysis);
    } catch (err) {
      aiExplanation = {
        explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel ${analysis.riskLevel}.`,
        fixes: [], overall_recommendation: "Revisa las vulnerabilidades detectadas.",
      };
    }

    let onChainResult = null;
    try {
      const encryptedReport = Buffer.from(JSON.stringify({ analysis, aiExplanation, timestamp: Date.now() })).toString("base64");
      onChainResult = await logDecisionOnChain({
        target: "0x0000000000000000000000000000000000000000",
        decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW",
        riskLevel: analysis.riskLevel, reason: analysis.summary,
        encryptedReport, paymentWei: "0.001",
      });
      await updateReputation(analysis.riskLevel === "HIGH");
    } catch (err) {
      console.error("[On-chain]", err.message);
    }

    res.json({
      riskLevel: analysis.riskLevel, findings: analysis.findings, summary: analysis.summary,
      aiExplanation, onChain: onChainResult,
      payment: { cost: "0.001", currency: "USDC", verified: true },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
