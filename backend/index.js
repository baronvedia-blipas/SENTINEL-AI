/**
 * Sentinel AI — Backend API Server
 *
 * Endpoints:
 *   POST /api/analyze/contract    — Analyze Solidity code for vulnerabilities ($0.001 x402)
 *   POST /api/analyze/transaction — Analyze transaction risk ($0.0005 x402)
 *   POST /api/agent/evaluate      — Agent Guard: block/allow decision ($0.001 x402)
 *   GET  /api/audit-log           — Recent on-chain audit log (free)
 *   GET  /api/agent/identity      — ERC-8004 agent info (free)
 *   GET  /api/agent/reputation    — Agent reputation score (free)
 *   GET  /api/pricing             — x402 pricing info (free)
 *   GET  /api/health              — Health check (free)
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { analyzeContract } = require("../api/lib/contractAnalyzer");
const { analyzeTransaction } = require("../api/lib/txAnalyzer");
const { evaluateAction } = require("../api/lib/agentGuard");
const { explainContractAnalysis, explainTransactionRisk } = require("../api/lib/claudeService");
const { encryptReport } = require("../api/lib/encryptionService");
const { logDecisionOnChain, updateReputation, getAgentReputation, getAgentIdentity, getRecentAuditLog, getBalance } = require("../api/lib/avalancheService");

// Simple x402 middleware (inline — original was deleted)
const x402PaymentMiddleware = (cost) => (req, res, next) => {
  if (!req.headers["x-402-payment"]) {
    return res.status(402).json({ error: "Payment Required", protocol: "x402", pricing: { cost, currency: "USDC" } });
  }
  next();
};
const getPricing = () => [
  { endpoint: "/api/analyze/contract", cost: "0.001", currency: "USDC" },
  { endpoint: "/api/analyze/transaction", cost: "0.0005", currency: "USDC" },
  { endpoint: "/api/agent/evaluate", cost: "0.001", currency: "USDC" },
];

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// x402 middleware applied per-route below (was incorrectly global)

// ─── Health Check ──────────────────────────────────
app.get("/api/health", async (req, res) => {
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
});

// ─── Contract Analysis ────────────────────────────
app.post("/api/analyze/contract", x402PaymentMiddleware("0.001"), async (req, res) => {
  try {
    const { sourceCode } = req.body;
    if (!sourceCode) {
      return res.status(400).json({ error: "sourceCode is required" });
    }

    // Step 1: Rule-based analysis
    const analysis = analyzeContract(sourceCode);

    // Step 2: Claude explanation (in Spanish)
    let aiExplanation;
    try {
      aiExplanation = await explainContractAnalysis(sourceCode, analysis);
    } catch (err) {
      console.error("[Claude] Error:", err.message);
      aiExplanation = {
        explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel de riesgo ${analysis.riskLevel}.`,
        fixes: [],
        overall_recommendation: "Revisa las vulnerabilidades detectadas.",
      };
    }

    // Step 3: Log on-chain (async, don't block response)
    let onChainResult = null;
    try {
      const encryptedReport = Buffer.from(JSON.stringify({
        analysis,
        aiExplanation,
        timestamp: Date.now(),
      })).toString("base64");

      onChainResult = await logDecisionOnChain({
        target: "0x0000000000000000000000000000000000000000",
        decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW",
        riskLevel: analysis.riskLevel,
        reason: analysis.summary,
        encryptedReport,
        paymentWei: "0.001",
      });

      // Update ERC-8004 reputation
      await updateReputation(analysis.riskLevel === "HIGH");
    } catch (err) {
      console.error("[On-chain] Error:", err.message);
    }

    res.json({
      riskLevel: analysis.riskLevel,
      findings: analysis.findings,
      summary: analysis.summary,
      aiExplanation,
      onChain: onChainResult,
      payment: req.x402Payment || null,
    });
  } catch (error) {
    console.error("[Contract Analysis] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Transaction Analysis ─────────────────────────
app.post("/api/analyze/transaction", x402PaymentMiddleware("0.0005"), async (req, res) => {
  try {
    const tx = req.body;
    if (!tx.type) {
      return res.status(400).json({ error: "Transaction type is required" });
    }

    // Step 1: Rule-based analysis
    const analysis = analyzeTransaction(tx);

    // Step 2: Claude explanation
    let aiExplanation;
    try {
      aiExplanation = await explainTransactionRisk(tx, analysis);
    } catch (err) {
      console.error("[Claude] Error:", err.message);
      aiExplanation = {
        explanation: analysis.summary,
        recommendation: "Verifica los detalles de la transacción.",
      };
    }

    // Step 3: Log on-chain
    let onChainResult = null;
    try {
      onChainResult = await logDecisionOnChain({
        target: tx.contractAddress || "0x0000000000000000000000000000000000000000",
        decision: analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW",
        riskLevel: analysis.riskLevel,
        reason: analysis.summary,
        encryptedReport: "",
        paymentWei: "0.0005",
      });

      await updateReputation(analysis.riskLevel === "HIGH");
    } catch (err) {
      console.error("[On-chain] Error:", err.message);
    }

    res.json({
      riskLevel: analysis.riskLevel,
      findings: analysis.findings,
      summary: analysis.summary,
      aiExplanation,
      onChain: onChainResult,
      payment: req.x402Payment || null,
    });
  } catch (error) {
    console.error("[TX Analysis] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Agent Guard ──────────────────────────────────
app.post("/api/agent/evaluate", x402PaymentMiddleware("0.001"), async (req, res) => {
  try {
    const action = req.body;
    if (!action.actionType) {
      return res.status(400).json({ error: "actionType is required" });
    }

    // Step 1: Evaluate action
    const result = evaluateAction(action);

    // Step 2: Log on-chain
    let onChainResult = null;
    try {
      onChainResult = await logDecisionOnChain({
        target: action.payload?.contractAddress || action.payload?.to || "0x0000000000000000000000000000000000000000",
        decision: result.decision,
        riskLevel: result.riskLevel,
        reason: result.reason,
        encryptedReport: Buffer.from(JSON.stringify(result)).toString("base64"),
        paymentWei: "0.001",
      });

      await updateReputation(result.decision === "BLOCK");
    } catch (err) {
      console.error("[On-chain] Error:", err.message);
    }

    res.json({
      ...result,
      onChain: onChainResult,
      payment: req.x402Payment || null,
    });
  } catch (error) {
    console.error("[Agent Guard] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Free Endpoints ───────────────────────────────
app.get("/api/audit-log", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const entries = await getRecentAuditLog(count);
    res.json({ entries, count: entries.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/agent/identity", async (req, res) => {
  try {
    const identity = await getAgentIdentity();
    res.json(identity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/agent/reputation", async (req, res) => {
  try {
    const reputation = await getAgentReputation();
    res.json(reputation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pricing", (req, res) => {
  res.json({
    protocol: "x402",
    network: "avalanche-fuji",
    endpoints: getPricing(),
  });
});

// ─── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🛡️  Sentinel AI Backend running on port ${PORT}`);
  console.log(`   Network: Avalanche Fuji (43113)`);
  console.log(`   Guard:   ${process.env.SENTINEL_GUARD_ADDRESS}`);
  console.log(`   ERC8004: ${process.env.SENTINEL_ERC8004_ADDRESS}`);
  console.log(`\n   Endpoints:`);
  console.log(`   POST /api/analyze/contract    — $0.001 USDC`);
  console.log(`   POST /api/analyze/transaction — $0.0005 USDC`);
  console.log(`   POST /api/agent/evaluate      — $0.001 USDC`);
  console.log(`   GET  /api/audit-log           — Free`);
  console.log(`   GET  /api/agent/identity      — Free`);
  console.log(`   GET  /api/agent/reputation    — Free`);
  console.log(`   GET  /api/pricing             — Free`);
  console.log(`   GET  /api/health              — Free\n`);
});
