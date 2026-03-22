import { useState } from "react";
import { t } from "../i18n.js";

const PRESETS = [
  {
    labelKey: "unlimitedApprovePreset",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
    ),
    riskColor: "var(--red)",
    riskLabel: "HIGH",
    data: {
      type: "approve",
      amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      contractAddress: "0xdead000000000000000000000000000000000000",
      spender: "0xattacker0000000000000000000000000000000",
    },
  },
  {
    labelKey: "highValueTransfer",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    riskColor: "var(--yellow)",
    riskLabel: "MEDIUM",
    data: {
      type: "transfer",
      amount: "500",
      to: "0xunknown0000000000000000000000000000000",
      contractAddress: "0xtoken00000000000000000000000000000000",
      threshold: "100",
    },
  },
  {
    labelKey: "safeTransferPreset",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
    riskColor: "var(--accent)",
    riskLabel: "LOW",
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
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold gradient-text">{t(lang, "txTitle")}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t(lang, "txDesc")}
          </p>
        </div>

        {/* Preset cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESETS.map((preset, i) => (
            <button
              key={i}
              onClick={() => loadPreset(preset)}
              className="preset-card p-4 text-left group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)] group-hover:border-[var(--accent-border)] transition-colors"
                  style={{ color: preset.riskColor }}>
                  {preset.icon}
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold risk-${preset.riskLabel.toLowerCase()}`}>
                  {preset.riskLabel}
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--text-primary)] block leading-tight">
                {t(lang, preset.labelKey)}
              </span>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "txType")}</label>
            <select
              value={txData.type}
              onChange={(e) => setTxData({ ...txData, type: e.target.value })}
              className="w-full p-2.5 rounded-lg input-glow text-sm font-mono"
            >
              <option value="approve">{t(lang, "approve")}</option>
              <option value="transfer">{t(lang, "transfer")}</option>
              <option value="swap">{t(lang, "swap")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "amount")}</label>
            <input
              type="text"
              value={txData.amount}
              onChange={(e) => setTxData({ ...txData, amount: e.target.value })}
              placeholder="100"
              className="w-full p-2.5 rounded-lg input-glow text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "contractAddress")}</label>
            <input
              type="text"
              value={txData.contractAddress}
              onChange={(e) => setTxData({ ...txData, contractAddress: e.target.value })}
              placeholder="0x..."
              className="w-full p-2.5 rounded-lg input-glow text-sm font-mono text-xs"
            />
          </div>

          {txData.type === "approve" && (
            <div className="animate-slideUp">
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "spenderAddress")}</label>
              <input
                type="text"
                value={txData.spender}
                onChange={(e) => setTxData({ ...txData, spender: e.target.value })}
                placeholder="0x..."
                className="w-full p-2.5 rounded-lg input-glow text-sm font-mono text-xs"
              />
            </div>
          )}

          {txData.type === "transfer" && (
            <div className="animate-slideUp">
              <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "recipient")}</label>
              <input
                type="text"
                value={txData.to}
                onChange={(e) => setTxData({ ...txData, to: e.target.value })}
                placeholder="0x..."
                className="w-full p-2.5 rounded-lg input-glow text-sm font-mono text-xs"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {t(lang, "cost")}: <span className="text-[var(--accent)]">$0.0005 USDC</span> {t(lang, "via")} x402
          </span>
          <button
            onClick={analyze}
            disabled={loading || !txData.amount}
            className="btn-primary px-8 py-2.5 rounded-lg font-mono text-sm tracking-wider"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {t(lang, "analyzing")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                {t(lang, "analyzeTransaction")}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-4">
        {result?.error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-slideUp">
            {t(lang, "error")}: {result.error}
          </div>
        )}

        {result && !result.error && (
          <div className="space-y-4 animate-slideUp">
            <div className="flex items-center gap-3">
              <span className={`px-5 py-2.5 rounded-lg font-bold text-lg tracking-wider risk-${result.riskLevel.toLowerCase()} ${
                result.riskLevel === "HIGH" ? "risk-pulse" : ""
              }`}>
                {result.riskLevel}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{result.summary}</span>
            </div>

            <div className="space-y-3 stagger-children">
              {result.findings?.map((f, i) => (
                <div key={i} className={`p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] card-glow finding-${f.severity.toLowerCase()}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()}`}>
                      {f.severity}
                    </span>
                    <span className="font-medium text-sm text-[var(--text-primary)]">{f.name}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">{f.warning}</p>
                  <p className="text-sm text-green-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {f.recommendation}
                  </p>
                </div>
              ))}
            </div>

            {result.aiExplanation && (
              <div className="p-5 rounded-xl glass-card">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-border)] flex items-center justify-center text-[10px]">AI</span>
                  {t(lang, "aiAnalysis")}
                  {result.aiExplanation._provider && result.aiExplanation._provider !== "fallback" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">
                      {result.aiExplanation._provider}
                    </span>
                  ) : result.aiExplanation._provider === "fallback" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                      {t(lang, "ruleBased")}
                    </span>
                  ) : null}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.aiExplanation.explanation}</p>
              </div>
            )}

            {result.onChain && (
              <div className="p-4 rounded-xl bg-green-500/8 border border-green-500/20">
                <h3 className="font-semibold text-sm mb-1 text-green-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                  {t(lang, "onChainRecord")}
                </h3>
                <a href={result.onChain.explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs transition-colors">
                  {result.onChain.txHash}
                </a>
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="h-full min-h-[300px] flex items-center justify-center text-[var(--text-secondary)] text-sm">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--text-secondary)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <p>{t(lang, "emptyTx")} "{t(lang, "analyzeTransaction")}"</p>
              <p className="text-xs opacity-60">{t(lang, "emptyTxHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
