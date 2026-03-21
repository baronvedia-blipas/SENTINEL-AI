/**
 * Agent Guard — ERC-8004 core feature.
 *
 * When an AI agent wants to execute an action:
 *   1. Action passes through risk analyzers
 *   2. If HIGH risk → BLOCKED + logged on-chain + reputation updated
 *   3. If LOW/MEDIUM risk → ALLOWED + logged on-chain + reputation updated
 *
 * This is the "guard layer" that makes Sentinel an autonomous security agent.
 */

const { analyzeContract } = require("./contractAnalyzer");
const { analyzeTransaction } = require("./txAnalyzer");

/**
 * Evaluate an agent action and decide BLOCK or ALLOW.
 * @param {{ actionType: string, payload: object }} action
 * @returns {{ decision: string, riskLevel: string, reason: string, findings: Array }}
 */
function evaluateAction(action) {
  if (!action || !action.actionType) {
    return {
      decision: "BLOCK",
      riskLevel: "HIGH",
      reason: "Invalid action: no actionType provided",
      findings: [],
    };
  }

  let analysis;

  switch (action.actionType) {
    case "deploy_contract":
    case "contract_interaction":
      if (!action.payload?.sourceCode) {
        return {
          decision: "BLOCK",
          riskLevel: "HIGH",
          reason: "No source code provided for contract action",
          findings: [],
        };
      }
      analysis = analyzeContract(action.payload.sourceCode);
      break;

    case "transfer":
    case "approve":
    case "swap":
      analysis = analyzeTransaction({
        type: action.actionType,
        amount: action.payload?.amount || "0",
        contractAddress: action.payload?.contractAddress,
        spender: action.payload?.spender,
        to: action.payload?.to,
        from: action.payload?.from,
        threshold: action.payload?.threshold,
      });
      break;

    default:
      // Unknown action type — be cautious
      return {
        decision: "BLOCK",
        riskLevel: "MEDIUM",
        reason: `Unknown action type: ${action.actionType}`,
        findings: [],
      };
  }

  // Decision logic: BLOCK if HIGH risk, ALLOW otherwise
  const decision = analysis.riskLevel === "HIGH" ? "BLOCK" : "ALLOW";

  const reason = decision === "BLOCK"
    ? `Action blocked: ${analysis.summary}`
    : `Action allowed: ${analysis.summary}`;

  return {
    decision,
    riskLevel: analysis.riskLevel,
    reason,
    findings: analysis.findings,
  };
}

module.exports = { evaluateAction };
