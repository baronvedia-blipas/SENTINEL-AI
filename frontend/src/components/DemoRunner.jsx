import { useState } from "react";
import { t } from "../i18n.js";

const DEMO_STEPS = [
  {
    id: 1,
    title: "Analyze Vulnerable Contract",
    description: "Sentinel detects reentrancy vulnerability in a Solidity contract",
    icon: "📝",
    endpoint: "/api/analyze/contract",
    method: "POST",
    body: {
      sourceCode: `pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 bal = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: bal}("");
        require(success);
        balances[msg.sender] = 0;
    }

    function isOwner() public view returns (bool) {
        return tx.origin == msg.sender;
    }
}`,
    },
    expectBlock: true,
  },
  {
    id: 2,
    title: "Block Unlimited Approval",
    description: "An AI agent tries to approve unlimited tokens — Sentinel blocks it",
    icon: "🚫",
    endpoint: "/api/agent/evaluate",
    method: "POST",
    body: {
      actionType: "approve",
      payload: {
        amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        contractAddress: "0xdead000000000000000000000000000000000000",
        spender: "0xmalicious000000000000000000000000000000",
      },
    },
    expectBlock: true,
  },
  {
    id: 3,
    title: "Allow Safe Transfer",
    description: "A safe 10 USDC transfer — Sentinel approves it",
    icon: "✅",
    endpoint: "/api/agent/evaluate",
    method: "POST",
    body: {
      actionType: "transfer",
      payload: {
        amount: "10",
        to: "0x567FCdC8e7148a60b91F3367D09EB1b23aF413aC",
        contractAddress: "0x0000000000000000000000000000000000000000",
        threshold: "100",
      },
    },
    expectBlock: false,
  },
];

export default function DemoRunner({ onComplete, lang = "es" }) {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [results, setResults] = useState([]);
  const [screenFlash, setScreenFlash] = useState(null);

  const runDemo = async () => {
    setRunning(true);
    setResults([]);
    setCurrentStep(0);

    for (let i = 0; i < DEMO_STEPS.length; i++) {
      setCurrentStep(i);
      const step = DEMO_STEPS[i];

      // Wait for dramatic effect
      await new Promise((r) => setTimeout(r, 1500));

      try {
        const res = await fetch(step.endpoint, {
          method: step.method,
          headers: {
            "Content-Type": "application/json",
            "X-402-Payment": "demo-payment",
          },
          body: JSON.stringify(step.body),
        });
        const data = await res.json();

        // Flash effect
        const isBlock = data.decision === "BLOCK" || data.riskLevel === "HIGH";
        setScreenFlash(isBlock ? "block" : "allow");
        setTimeout(() => setScreenFlash(null), 1000);

        setResults((prev) => [...prev, { step, data, success: true }]);
      } catch (err) {
        setResults((prev) => [...prev, { step, error: err.message, success: false }]);
      }

      // Pause between steps
      await new Promise((r) => setTimeout(r, 2000));
    }

    setCurrentStep(-1);
    setRunning(false);
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      {/* Screen flash overlay */}
      {screenFlash && (
        <div className={`fixed inset-0 z-50 pointer-events-none animate-flash ${
          screenFlash === "block"
            ? "bg-red-500/20"
            : "bg-green-500/20"
        }`} />
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">{t(lang, "demoTitle")}</h2>
        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
          {t(lang, "demoDesc")}
        </p>
        <button
          onClick={runDemo}
          disabled={running}
          className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
            running
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          }`}
        >
          {running ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {t(lang, "runningDemo")}
            </span>
          ) : t(lang, "runDemo")}
        </button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_STEPS.map((step, i) => {
          const result = results[i];
          const isActive = currentStep === i;
          const isDone = result !== undefined;

          return (
            <div
              key={step.id}
              className={`p-5 rounded-xl border transition-all duration-500 ${
                isActive
                  ? "bg-blue-500/10 border-blue-500/40 scale-105 shadow-lg shadow-blue-500/20"
                  : isDone
                  ? result.data?.decision === "BLOCK" || result.data?.riskLevel === "HIGH"
                    ? "bg-red-500/5 border-red-500/30"
                    : "bg-green-500/5 border-green-500/30"
                  : "bg-[var(--bg-card)] border-[var(--border-color)]"
              }`}
            >
              {/* Step header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs text-[var(--text-secondary)]">Step {step.id}</span>
                {isActive && (
                  <svg className="animate-spin h-4 w-4 text-blue-400 ml-auto" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
              </div>

              <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3">{step.description}</p>

              {/* Result */}
              {isDone && result.success && (
                <div className="space-y-2">
                  {/* Decision badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm ${
                    result.data.decision === "BLOCK" || result.data.riskLevel === "HIGH"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : result.data.decision === "ALLOW" || result.data.riskLevel === "LOW"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  }`}>
                    {result.data.decision === "BLOCK" || result.data.riskLevel === "HIGH" ? "🚫" : "✅"}
                    {result.data.decision || result.data.riskLevel}
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[var(--text-secondary)]">
                    {result.data.summary || result.data.reason}
                  </p>

                  {/* On-chain link */}
                  {result.data.onChain && (
                    <a
                      href={result.data.onChain.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline block font-mono truncate"
                    >
                      TX: {result.data.onChain.txHash}
                    </a>
                  )}
                </div>
              )}

              {isDone && !result.success && (
                <p className="text-xs text-red-400">Error: {result.error}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Results summary */}
      {results.length === DEMO_STEPS.length && (
        <div className="text-center p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-lg font-bold mb-2">Demo Complete</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            All {DEMO_STEPS.length} actions analyzed and logged on Avalanche Fuji.
            Check the Audit Log tab to see the full on-chain history.
          </p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {results.filter(r => r.data?.decision === "BLOCK" || r.data?.riskLevel === "HIGH").length}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Threats Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {results.filter(r => r.data?.decision === "ALLOW" || (r.data?.riskLevel === "LOW" && !r.data?.decision)).length}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Safe Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {results.filter(r => r.data?.onChain).length}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">On-Chain TXs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
