const { analyzeContract } = require("./lib/contractAnalyzer.js");
const { analyzeTransaction } = require("./lib/txAnalyzer.js");
const { evaluateAction } = require("./lib/agentGuard.js");
const { explainContractAnalysis, explainTransactionRisk } = require("./lib/claudeService.js");
const {
  logDecisionOnChain, updateReputation, getAgentReputation,
  getAgentIdentity, getRecentAuditLog, getBalance,
} = require("./lib/avalancheService.js");

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-402-Payment");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Route based on path: /api/xxx → xxx
  const path = req.url.replace(/\?.*$/, "").replace(/^\/api\//, "");

  try {
    // ── GET routes ──
    if (req.method === "GET") {
      if (path === "health") {
        try {
          const balance = await getBalance();
          return res.json({ status: "ok", agent: "Sentinel AI", network: "Avalanche Fuji", balance: `${balance} AVAX`, contracts: { guard: process.env.SENTINEL_GUARD_ADDRESS, erc8004: process.env.SENTINEL_ERC8004_ADDRESS } });
        } catch (e) { return res.json({ status: "ok", agent: "Sentinel AI", error: e.message }); }
      }

      if (path === "agent/identity") {
        const identity = await getAgentIdentity();
        return res.json(identity);
      }

      if (path === "agent/reputation") {
        const reputation = await getAgentReputation();
        return res.json(reputation);
      }

      if (path === "audit-log") {
        const count = parseInt(req.query?.count) || 10;
        const entries = await getRecentAuditLog(count);
        return res.json({ entries, count: entries.length });
      }

      if (path === "pricing") {
        return res.json({
          protocol: "x402", network: "avalanche-fuji",
          endpoints: [
            { endpoint: "/api/analyze/contract", cost: "0.001", currency: "USDC", description: "Contract Analysis" },
            { endpoint: "/api/analyze/transaction", cost: "0.0005", currency: "USDC", description: "Transaction Analysis" },
            { endpoint: "/api/agent/evaluate", cost: "0.001", currency: "USDC", description: "Agent Guard Evaluation" },
          ],
        });
      }
    }

    // ── POST routes ──
    if (req.method === "POST") {
      const paymentHeader = req.headers["x-402-payment"];

      if (path === "analyze/contract") {
        const { sourceCode, lang } = req.body;
        if (!sourceCode) return res.status(400).json({ error: "sourceCode is required" });
        if (!paymentHeader) return res.status(402).json({ error: "Payment Required", protocol: "x402", pricing: { cost: "0.001", currency: "USDC" } });

        const analysis = analyzeContract(sourceCode);
        let aiExplanation;
        try { aiExplanation = await explainContractAnalysis(sourceCode, analysis, lang); }
        catch { aiExplanation = { explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel ${analysis.riskLevel}.`, fixes: [], overall_recommendation: "Revisa las vulnerabilidades." }; }

        let onChainResult = null;
        try {
          onChainResult = await logDecisionOnChain({ target: "0x0000000000000000000000000000000000000000", decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW", riskLevel: analysis.riskLevel, reason: analysis.summary, encryptedReport: Buffer.from(JSON.stringify({ analysis, aiExplanation })).toString("base64"), paymentWei: "0.001" });
          await updateReputation(analysis.riskLevel === "HIGH");
        } catch (e) { console.error("[On-chain]", e.message); }

        return res.json({ riskLevel: analysis.riskLevel, findings: analysis.findings, summary: analysis.summary, aiExplanation, onChain: onChainResult, payment: { cost: "0.001", currency: "USDC", verified: true } });
      }

      if (path === "analyze/transaction") {
        const tx = req.body;
        if (!tx.type) return res.status(400).json({ error: "type is required" });
        if (!paymentHeader) return res.status(402).json({ error: "Payment Required", protocol: "x402", pricing: { cost: "0.0005", currency: "USDC" } });

        const analysis = analyzeTransaction(tx);
        let aiExplanation;
        try { aiExplanation = await explainTransactionRisk(tx, analysis, tx.lang); }
        catch { aiExplanation = { explanation: analysis.summary, recommendation: "Verifica los detalles." }; }

        let onChainResult = null;
        try {
          onChainResult = await logDecisionOnChain({ target: tx.contractAddress || "0x0000000000000000000000000000000000000000", decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW", riskLevel: analysis.riskLevel, reason: analysis.summary, encryptedReport: "", paymentWei: "0.0005" });
          await updateReputation(analysis.riskLevel === "HIGH");
        } catch (e) { console.error("[On-chain]", e.message); }

        return res.json({ riskLevel: analysis.riskLevel, findings: analysis.findings, summary: analysis.summary, aiExplanation, onChain: onChainResult, payment: { cost: "0.0005", currency: "USDC", verified: true } });
      }

      if (path === "agent/evaluate") {
        const action = req.body;
        if (!action.actionType) return res.status(400).json({ error: "actionType is required" });
        if (!paymentHeader) return res.status(402).json({ error: "Payment Required", protocol: "x402", pricing: { cost: "0.001", currency: "USDC" } });

        const result = evaluateAction(action);
        let onChainResult = null;
        try {
          onChainResult = await logDecisionOnChain({ target: action.payload?.contractAddress || action.payload?.to || "0x0000000000000000000000000000000000000000", decision: result.decision, riskLevel: result.riskLevel, reason: result.reason, encryptedReport: Buffer.from(JSON.stringify(result)).toString("base64"), paymentWei: "0.001" });
          await updateReputation(result.decision === "BLOCK");
        } catch (e) { console.error("[On-chain]", e.message); }

        return res.json({ ...result, onChain: onChainResult, payment: { cost: "0.001", currency: "USDC", verified: true } });
      }
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
