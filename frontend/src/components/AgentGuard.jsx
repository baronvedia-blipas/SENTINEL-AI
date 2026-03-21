import { useState } from "react";

const SCENARIOS = [
  {
    label: "Deploy Vulnerable Contract",
    action: {
      actionType: "deploy_contract",
      payload: {
        sourceCode: `pragma solidity ^0.8.0;
contract Unsafe {
    mapping(address => uint256) public balances;
    function withdraw() public {
        (bool s,) = msg.sender.call{value: balances[msg.sender]}("");
        require(s);
        balances[msg.sender] = 0;
    }
}`,
      },
    },
  },
  {
    label: "Unlimited Token Approve",
    action: {
      actionType: "approve",
      payload: {
        amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        contractAddress: "0xdead000000000000000000000000000000000000",
        spender: "0xmalicious000000000000000000000000000000",
      },
    },
  },
  {
    label: "Safe Transfer (10 USDC)",
    action: {
      actionType: "transfer",
      payload: {
        amount: "10",
        to: "0xfriend00000000000000000000000000000000",
        contractAddress: "0x0000000000000000000000000000000000000000",
        threshold: "100",
      },
    },
  },
];

export default function AgentGuard({ onAnalysis }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenFlash, setScreenFlash] = useState(null);

  const evaluate = async (scenario) => {
    setSelectedScenario(scenario);
    setLoading(true);
    setResult(null);
    setScreenFlash(null);

    try {
      const res = await fetch("/api/agent/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-402-Payment": "demo-payment-token",
        },
        body: JSON.stringify(scenario.action),
      });
      const data = await res.json();
      setResult(data);

      // Flash effect
      setScreenFlash(data.decision === "BLOCK" ? "block" : "allow");
      setTimeout(() => setScreenFlash(null), 1200);

      onAnalysis?.();
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen flash overlay */}
      {screenFlash && (
        <div className={`fixed inset-0 z-50 pointer-events-none animate-flash ${
          screenFlash === "block" ? "bg-red-500/30" : "bg-green-500/20"
        }`} />
      )}

      <div>
        <h2 className="text-lg font-semibold">AI Agent Guard (ERC-8004)</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Sentinel acts as a security guard for AI agents. When an agent wants to execute an action,
          it passes through Sentinel first. Risky actions are BLOCKED and logged on-chain.
        </p>
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario, i) => (
          <button
            key={i}
            onClick={() => evaluate(scenario)}
            disabled={loading}
            className={`p-5 rounded-xl text-left transition-all border card-glow ${
              selectedScenario === scenario
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]"
            } disabled:opacity-50`}
          >
            <div className="text-2xl mb-2">
              {i === 0 ? "📝" : i === 1 ? "💰" : "✅"}
            </div>
            <h3 className="font-medium text-sm mb-1">{scenario.label}</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {scenario.action.actionType}
            </p>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>Sentinel is evaluating the action...</span>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !result.error && !loading && (
        <div className="space-y-4">
          {/* Decision Banner */}
          <div className={`p-6 rounded-xl border text-center animate-pop ${
            result.decision === "BLOCK"
              ? "bg-red-500/10 border-red-500/30 animate-shake"
              : "bg-green-500/10 border-green-500/30"
          }`}>
            <div className="text-5xl mb-3">
              {result.decision === "BLOCK" ? "🚫" : "✅"}
            </div>
            <h3 className={`text-3xl font-black tracking-wider ${
              result.decision === "BLOCK" ? "text-red-400" : "text-green-400"
            }`}>
              {result.decision === "BLOCK" ? "ACTION BLOCKED" : "ACTION ALLOWED"}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{result.reason}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-lg text-sm font-medium risk-${result.riskLevel.toLowerCase()}`}>
              Risk: {result.riskLevel}
            </span>
          </div>

          {/* Findings */}
          {result.findings?.length > 0 && (
            <div className="space-y-2">
              {result.findings.map((f, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()} mr-2`}>
                    {f.severity}
                  </span>
                  {f.name}: {f.detail || f.warning}
                </div>
              ))}
            </div>
          )}

          {/* On-chain proof */}
          {result.onChain && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                <h3 className="font-semibold text-sm text-green-300">Logged on Avalanche Fuji</h3>
              </div>
              <a href={result.onChain.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:underline font-mono text-xs">
                {result.onChain.txHash}
              </a>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Entry #{result.onChain.entryId} — Reputation updated
              </p>
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          Error: {result.error}
        </div>
      )}
    </div>
  );
}
