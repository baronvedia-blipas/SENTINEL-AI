import { useState } from "react";
import { t } from "../i18n.js";

const EXAMPLE_VULNERABLE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    function transfer(address to, uint256 amount) public {
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }

    function isOwner() public view returns (bool) {
        return tx.origin == msg.sender;
    }
}`;

export default function ContractAnalyzer({ onAnalysis, lang = "es" }) {
  const [sourceCode, setSourceCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-402-Payment": "demo-payment-token",
        },
        body: JSON.stringify({ sourceCode, lang }),
      });
      const data = await res.json();
      setResult(data);
      onAnalysis?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t(lang, "contractTitle")}</h2>
          <button
            onClick={() => setSourceCode(EXAMPLE_VULNERABLE)}
            className="text-xs px-3 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            {t(lang, "loadExample")}
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          {t(lang, "contractDesc")}
        </p>

        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          placeholder={t(lang, "pasteCode")}
          className="w-full h-80 p-4 code-block resize-none focus:outline-none focus:border-blue-500/50 text-sm text-green-300"
          spellCheck={false}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            {t(lang, "cost")}: $0.001 USDC {t(lang, "via")} x402
          </span>
          <button
            onClick={analyze}
            disabled={loading || !sourceCode.trim()}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {t(lang, "analyzing")}
              </span>
            ) : t(lang, "analyzeBtn")}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            Error: {error}
          </div>
        )}

        {result?.riskLevel === "INVALID" && (
          <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">{t(lang, "notSolidity")}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {t(lang, "notSolidityDesc")}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {t(lang, "notSolidityHint")} <code className="text-yellow-300">pragma solidity</code> {t(lang, "notSolidityHint2")} <code className="text-yellow-300">contract</code>, <code className="text-yellow-300">function</code>, {t(lang, "notSolidityEtc")}
            </p>
          </div>
        )}

        {result && result.riskLevel !== "INVALID" && (
          <>
            {/* Risk Badge */}
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold text-lg risk-${result.riskLevel.toLowerCase()}`}>
                {result.riskLevel}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{result.summary}</span>
            </div>

            {/* Findings */}
            {result.findings?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">{t(lang, "findings")}</h3>
                {result.findings.map((f, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] card-glow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()}`}>
                        {f.severity}
                      </span>
                      <span className="font-medium text-sm">{f.name}</span>
                      <span className="text-xs text-[var(--text-secondary)] ml-auto">{t(lang, "line")} {f.line}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{f.detail}</p>
                    <code className="text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded block overflow-x-auto">
                      {f.code}
                    </code>
                  </div>
                ))}
              </div>
            )}

            {/* AI Explanation */}
            {result.aiExplanation && (
              <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span>🤖</span> {t(lang, "aiAnalysis")}
                  {result.aiExplanation._provider && result.aiExplanation._provider !== "fallback" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">
                      {result.aiExplanation._provider}
                    </span>
                  ) : result.aiExplanation._provider === "fallback" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                      rule-based
                    </span>
                  ) : null}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-3">
                  {result.aiExplanation.explanation}
                </p>

                {result.aiExplanation.fixes?.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <h4 className="text-xs font-semibold text-blue-300">{t(lang, "suggestedFixes")}:</h4>
                    {result.aiExplanation.fixes.map((fix, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-green-400 font-medium">{fix.vulnerability}:</span>{" "}
                        <span className="text-[var(--text-secondary)]">{fix.fix}</span>
                        {fix.code_example && (
                          <pre className="mt-2 p-3 code-block text-xs text-green-300 overflow-x-auto">
                            {fix.code_example}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.aiExplanation.overall_recommendation && (
                  <p className="text-sm text-blue-300 bg-blue-500/10 p-2 rounded">
                    {result.aiExplanation.overall_recommendation}
                  </p>
                )}
              </div>
            )}

            {/* On-chain proof */}
            {result.onChain && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="font-semibold text-sm mb-2 text-green-300">{t(lang, "onChainRecord")}</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-[var(--text-secondary)]">{t(lang, "txHash")}: </span>
                    <a
                      href={result.onChain.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-mono text-xs"
                    >
                      {result.onChain.txHash}
                    </a>
                  </p>
                  <p>
                    <span className="text-[var(--text-secondary)]">{t(lang, "entryId")}: </span>
                    <span className="font-mono">{result.onChain.entryId}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Payment info */}
            {result.payment && (
              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <span>{t(lang, "x402Payment")}:</span>
                <span className="text-green-400">${result.payment.cost} {result.payment.currency}</span>
                <span>{t(lang, "verified")}</span>
              </div>
            )}
          </>
        )}

        {!result && !error && (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm">
            <div className="text-center">
              <div className="text-4xl mb-3">📝</div>
              <p>{t(lang, "emptyContract")} "{t(lang, "analyzeBtn")}"</p>
              <p className="text-xs mt-1">{t(lang, "emptyContractHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
