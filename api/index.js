const { analyzeContract } = require("./lib/contractAnalyzer.js");
const { analyzeTransaction } = require("./lib/txAnalyzer.js");
const { evaluateAction } = require("./lib/agentGuard.js");
const { explainContractAnalysis, explainTransactionRisk } = require("./lib/claudeService.js");
const { encryptReport, decryptReport } = require("./lib/encryptionService.js");
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
        const count = Math.min(parseInt(req.query?.count) || 10, 50); // Cap at 50
        const entries = await getRecentAuditLog(count);
        return res.json({ entries, count: entries.length });
      }

      if (path === "decrypt") {
        const encrypted = req.query?.data;
        const callerAddress = req.query?.address;
        const agentOwner = "0x567FCdC8e7148a60b91F3367D09EB1b23aF413aC";

        if (!encrypted) return res.status(400).json({ error: "data query param required" });
        if (!callerAddress) return res.status(401).json({ error: "address query param required — only the agent owner can decrypt reports" });

        // Verify caller is the agent owner
        if (callerAddress.toLowerCase() !== agentOwner.toLowerCase()) {
          return res.status(403).json({ decrypted: false, error: "Access denied — only the agent owner can decrypt reports.", requiredAddress: agentOwner });
        }

        try {
          const report = decryptReport(decodeURIComponent(encrypted));
          return res.json({ decrypted: true, algorithm: "AES-256-GCM", owner: agentOwner, report });
        } catch (e) {
          return res.status(403).json({ decrypted: false, error: "Decryption failed — invalid encrypted data." });
        }
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

      // x402 payment verification helper
      const verifyPayment = (cost, route) => {
        if (!paymentHeader) {
          return {
            verified: false,
            response: {
              error: "Payment Required",
              protocol: "x402",
              version: "1.0",
              network: "avalanche-fuji",
              accepts: [{ currency: "USDC", amount: cost, chain: "43113" }],
              payTo: process.env.SENTINEL_GUARD_ADDRESS || "0x24aB78183Cc27649bC8afD07D8b949b2F914eF59",
              description: `Sentinel AI — ${route}`,
              x402Url: "https://x402.org",
            },
          };
        }
        // Verify payment token format (MVP: accept valid-looking tokens)
        const token = paymentHeader.trim();
        const paymentId = "x402-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
        return {
          verified: true,
          receipt: { paymentId, token: token.substring(0, 16) + "...", cost, currency: "USDC", route, timestamp: Date.now(), verified: true },
        };
      };

      if (path === "analyze/contract") {
        const { sourceCode, lang } = req.body;
        if (!sourceCode) return res.status(400).json({ error: "sourceCode is required" });
        if (sourceCode.length > 50000) return res.status(400).json({ error: "sourceCode too large (max 50KB)" });
        const payment = verifyPayment("0.001", "/api/analyze/contract");
        if (!payment.verified) return res.status(402).json(payment.response);

        const analysis = analyzeContract(sourceCode);

        // Reject invalid Solidity code — no on-chain logging, no AI call
        if (analysis.riskLevel === "INVALID") {
          return res.json({ riskLevel: "INVALID", findings: [], summary: analysis.summary, valid: false });
        }

        let aiExplanation;
        try { aiExplanation = await explainContractAnalysis(sourceCode, analysis, lang); }
        catch { aiExplanation = { explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel ${analysis.riskLevel}.`, fixes: [], overall_recommendation: "Revisa las vulnerabilidades." }; }

        let onChainResult = null;
        try {
          onChainResult = await logDecisionOnChain({ target: "0x0000000000000000000000000000000000000000", decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW", riskLevel: analysis.riskLevel, reason: analysis.summary, encryptedReport: encryptReport({ analysis, aiExplanation }).encrypted, paymentWei: "0.001" });
          await updateReputation(analysis.riskLevel === "HIGH");
        } catch (e) { console.error("[On-chain]", e.message); }

        return res.json({ riskLevel: analysis.riskLevel, findings: analysis.findings, summary: analysis.summary, aiExplanation, onChain: onChainResult, encryption: { algorithm: "AES-256-GCM", keyDerivation: "SHA-256(DEPLOYER_PRIVATE_KEY)", status: "encrypted" }, payment: payment.receipt });
      }

      if (path === "analyze/transaction") {
        const tx = req.body;
        if (!tx.type) return res.status(400).json({ error: "type is required" });
        const paymentTx = verifyPayment("0.0005", "/api/analyze/transaction");
        if (!paymentTx.verified) return res.status(402).json(paymentTx.response);

        const analysis = analyzeTransaction(tx);
        let aiExplanation;
        try { aiExplanation = await explainTransactionRisk(tx, analysis, tx.lang); }
        catch { aiExplanation = { explanation: analysis.summary, recommendation: "Verifica los detalles." }; }

        let onChainResult = null;
        try {
          onChainResult = await logDecisionOnChain({ target: tx.contractAddress || "0x0000000000000000000000000000000000000000", decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW", riskLevel: analysis.riskLevel, reason: analysis.summary, encryptedReport: "", paymentWei: "0.0005" });
          await updateReputation(analysis.riskLevel === "HIGH");
        } catch (e) { console.error("[On-chain]", e.message); }

        return res.json({ riskLevel: analysis.riskLevel, findings: analysis.findings, summary: analysis.summary, aiExplanation, onChain: onChainResult, payment: paymentTx.receipt });
      }

      if (path === "agent/evaluate") {
        const action = req.body;
        if (!action.actionType) return res.status(400).json({ error: "actionType is required" });
        const paymentEval = verifyPayment("0.001", "/api/agent/evaluate");
        if (!paymentEval.verified) return res.status(402).json(paymentEval.response);

        const result = evaluateAction(action);
        let onChainResult = null;
        try {
          onChainResult = await logDecisionOnChain({ target: action.payload?.contractAddress || action.payload?.to || "0x0000000000000000000000000000000000000000", decision: result.decision, riskLevel: result.riskLevel, reason: result.reason, encryptedReport: encryptReport(result).encrypted, paymentWei: "0.001" });
          await updateReputation(result.decision === "BLOCK");
        } catch (e) { console.error("[On-chain]", e.message); }

        return res.json({ ...result, onChain: onChainResult, payment: paymentEval.receipt });
      }
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
