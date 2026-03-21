/**
 * Transaction Risk Analyzer — Detects risky transaction patterns.
 *
 * Checks:
 * 1. Unlimited token approvals
 * 2. High-value transfers (> threshold)
 * 3. Interactions with unknown/unverified contracts
 * 4. Suspicious approval spenders
 */

// Known safe contracts on Fuji (expand as needed)
const KNOWN_CONTRACTS = new Set([
  "0x0000000000000000000000000000000000000000", // zero address
]);

const TX_RISK_RULES = [
  {
    id: "UNLIMITED_APPROVE",
    name: "Unlimited Token Approval",
    severity: "HIGH",
    check: (tx) => {
      if (tx.type !== "approve") return null;

      const amount = parseFloat(tx.amount);
      // type(uint256).max or very large amounts
      if (
        tx.amount === "115792089237316195423570985008687907853269984665640564039457584007913129639935" ||
        tx.amount === "unlimited" ||
        amount > 1e18
      ) {
        return {
          warning: `Unlimited approval detected for spender ${tx.spender}. This allows the spender to drain ALL your tokens at any time.`,
          recommendation: "Approve only the exact amount needed for the transaction.",
        };
      }
      return null;
    },
  },
  {
    id: "HIGH_VALUE_TRANSFER",
    name: "High-Value Transfer",
    severity: "HIGH",
    check: (tx) => {
      if (tx.type !== "transfer") return null;

      const amount = parseFloat(tx.amount);
      const threshold = parseFloat(tx.threshold || "100");

      if (amount > threshold) {
        return {
          warning: `High-value transfer of ${tx.amount} tokens detected. This exceeds the safety threshold of ${threshold}.`,
          recommendation: "Verify the recipient address carefully. Consider sending a small test amount first.",
        };
      }
      return null;
    },
  },
  {
    id: "UNKNOWN_CONTRACT",
    name: "Unknown Contract Interaction",
    severity: "MEDIUM",
    check: (tx) => {
      if (!tx.contractAddress) return null;

      if (!KNOWN_CONTRACTS.has(tx.contractAddress.toLowerCase())) {
        return {
          warning: `Interaction with unverified contract ${tx.contractAddress}. This contract has not been audited or verified.`,
          recommendation: "Verify the contract source code on the block explorer before interacting.",
        };
      }
      return null;
    },
  },
  {
    id: "ZERO_ADDRESS_TRANSFER",
    name: "Transfer to Zero Address",
    severity: "HIGH",
    check: (tx) => {
      if (tx.type === "transfer" && tx.to === "0x0000000000000000000000000000000000000000") {
        return {
          warning: "Transfer to the zero address detected. Tokens sent to this address are permanently burned.",
          recommendation: "Verify the recipient address. This action is irreversible.",
        };
      }
      return null;
    },
  },
  {
    id: "SUSPICIOUS_SPENDER",
    name: "Suspicious Spender Approval",
    severity: "MEDIUM",
    check: (tx) => {
      if (tx.type !== "approve" || !tx.spender) return null;

      // Check if spender is a known contract or if it looks suspicious
      if (tx.spender === tx.from) {
        return {
          warning: "Approving yourself as spender — this is unusual and may indicate a mistake.",
          recommendation: "Verify the spender address.",
        };
      }
      return null;
    },
  },
];

/**
 * Analyze a transaction for risk.
 * @param {{ type: string, amount: string, contractAddress?: string, spender?: string, to?: string, from?: string, threshold?: string }} tx
 * @returns {{ riskLevel: string, findings: Array, summary: string }}
 */
function analyzeTransaction(tx) {
  if (!tx || !tx.type) {
    return { riskLevel: "LOW", findings: [], summary: "No transaction data provided" };
  }

  const findings = [];

  for (const rule of TX_RISK_RULES) {
    const result = rule.check(tx);
    if (result) {
      findings.push({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        ...result,
      });
    }
  }

  const hasHigh = findings.some((f) => f.severity === "HIGH");
  const hasMedium = findings.some((f) => f.severity === "MEDIUM");

  let riskLevel = "LOW";
  if (hasHigh) riskLevel = "HIGH";
  else if (hasMedium) riskLevel = "MEDIUM";

  const summary = findings.length === 0
    ? "Transaction appears safe."
    : `Found ${findings.length} risk(s): ${findings.map(f => f.name).join(", ")}.`;

  return { riskLevel, findings, summary };
}

module.exports = { analyzeTransaction, TX_RISK_RULES };
