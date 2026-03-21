import { useState } from "react";
import { t } from "../i18n.js";

const PRESETS = [
  {
    label: "Unlimited Approve",
    data: {
      type: "approve",
      amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      contractAddress: "0xdead000000000000000000000000000000000000",
      spender: "0xattacker0000000000000000000000000000000",
    },
  },
  {
    label: "High-Value Transfer",
    data: {
      type: "transfer",
      amount: "500",
      to: "0xunknown0000000000000000000000000000000",
      contractAddress: "0xtoken00000000000000000000000000000000",
      threshold: "100",
    },
  },
  {
    label: "Safe Transfer",
    data: {
      type: "transfer",
      amount: "10",
      to: "0xfriend00000000000000000000000000000000",
      contractAddress: "0x0000000000000000000000000000000000000000",
      threshold: "100",
    },
  },
];

export default function TxAnalyzer({ onAnalysis, lang = "es" }) {
  const [txData, setTxData] = useState({
    type: "approve",
    amount: "",
    contractAddress: "",
    spender: "",
    to: "",
    threshold: "100",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-402-Payment": "demo-payment-token",
        },
        body: JSON.stringify({ ...txData, lang }),
      });
      const data = await res.json();
      setResult(data);
      onAnalysis?.();
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (preset) => {
    setTxData({ ...txData, ...preset.data });
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t(lang, "txTitle")}</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {t(lang, "txDesc")}
        </p>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => loadPreset(preset)}
              className="text-xs px-3 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">{t(lang, "txType")}</label>
            <select
              value={txData.type}
              onChange={(e) => setTxData({ ...txData, type: e.target.value })}
              className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500/50"
            >
              <option value="approve">Approve</option>
              <option value="transfer">Transfer</option>
              <option value="swap">Swap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">{t(lang, "amount")}</label>
            <input
              type="text"
              value={txData.amount}
              onChange={(e) => setTxData({ ...txData, amount: e.target.value })}
              placeholder="100"
              className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">{t(lang, "contractAddress")}</label>
            <input
              type="text"
              value={txData.contractAddress}
              onChange={(e) => setTxData({ ...txData, contractAddress: e.target.value })}
              placeholder="0x..."
              className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-mono text-xs focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {txData.type === "approve" && (
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">{t(lang, "spenderAddress")}</label>
              <input
                type="text"
                value={txData.spender}
                onChange={(e) => setTxData({ ...txData, spender: e.target.value })}
                placeholder="0x..."
                className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-mono text-xs focus:outline-none focus:border-blue-500/50"
              />
            </div>
          )}

          {txData.type === "transfer" && (
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">{t(lang, "recipient")}</label>
              <input
                type="text"
                value={txData.to}
                onChange={(e) => setTxData({ ...txData, to: e.target.value })}
                placeholder="0x..."
                className="w-full p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-mono text-xs focus:outline-none focus:border-blue-500/50"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">{t(lang, "cost")}: $0.0005 USDC {t(lang, "via")} x402</span>
          <button
            onClick={analyze}
            disabled={loading || !txData.amount}
            className="btn-primary px-6 py-2.5 rounded-lg font-mono text-sm tracking-wider"
          >
            {loading ? t(lang, "analyzing") : t(lang, "analyzeTransaction")}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-4">
        {result?.error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            Error: {result.error}
          </div>
        )}

        {result && !result.error && (
          <>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold text-lg risk-${result.riskLevel.toLowerCase()}`}>
                {result.riskLevel}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{result.summary}</span>
            </div>

            {result.findings?.map((f, i) => (
              <div key={i} className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] card-glow">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()}`}>
                    {f.severity}
                  </span>
                  <span className="font-medium text-sm">{f.name}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">{f.warning}</p>
                <p className="text-sm text-green-400">{f.recommendation}</p>
              </div>
            ))}

            {result.aiExplanation && (
              <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span>🤖</span> AI Explanation
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
                <p className="text-sm text-[var(--text-secondary)]">{result.aiExplanation.explanation}</p>
              </div>
            )}

            {result.onChain && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="font-semibold text-sm mb-1 text-green-300">On-Chain Record</h3>
                <a href={result.onChain.explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-mono text-xs">
                  {result.onChain.txHash}
                </a>
              </div>
            )}
          </>
        )}

        {!result && (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm">
            <div className="text-center">
              <div className="text-4xl mb-3">💸</div>
              <p>{t(lang, "emptyTx")} "{t(lang, "analyzeTransaction")}"</p>
              <p className="text-xs mt-1">{t(lang, "emptyTxHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
