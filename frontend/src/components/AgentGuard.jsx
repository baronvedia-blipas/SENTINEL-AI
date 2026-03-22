import { useState } from "react";
import { t } from "../i18n.js";
import X402Tooltip from "./X402Tooltip.jsx";

const SCENARIOS_DATA = [
  {
    labelEs: "Deployar Contrato Vulnerable",
    labelEn: "Deploy Vulnerable Contract",
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
    labelEs: "Aprobacion Ilimitada de Tokens",
    labelEn: "Unlimited Token Approve",
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
    labelEs: "Transferencia Segura (10 USDC)",
    labelEn: "Safe Transfer (10 USDC)",
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

const SCENARIO_STYLES = [
  {
    className: "scenario-danger",
    iconBg: "bg-[var(--red-glow)] border-[rgba(255,51,85,0.3)]",
    iconColor: "text-[var(--red)]",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    ),
  },
  {
    className: "scenario-warning",
    iconBg: "bg-[rgba(255,204,0,0.08)] border-[rgba(255,204,0,0.2)]",
    iconColor: "text-[var(--yellow)]",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    className: "scenario-safe",
    iconBg: "bg-[var(--accent-glow)] border-[var(--accent-border)]",
    iconColor: "text-[var(--accent)]",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
  },
];

// Shield scanning animation component
function ShieldScanOverlay({ lang }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Animated shield */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl border-2 border-[var(--accent-border)] bg-[var(--accent-glow)] flex items-center justify-center animate-glowPulse">
          <svg className="w-12 h-12 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        {/* Scan line */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60"
            style={{ animation: "shieldScan 1.5s ease-in-out infinite" }} />
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-[-12px] animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--accent)] opacity-60" />
        </div>
        <div className="absolute inset-[-12px] animate-spin" style={{ animationDuration: "3s", animationDelay: "-1s" }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--accent)] opacity-40" />
        </div>
      </div>
      {/* Scanning text */}
      <div className="text-center space-y-2">
        <p className="font-mono text-sm text-[var(--accent)]">{t(lang, "evaluating")}</p>
        <div className="flex items-center gap-1 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0.15s" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

export default function AgentGuard({ onAnalysis, lang = "es", addToHistory }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenFlash, setScreenFlash] = useState(null);
  const [mode, setMode] = useState("presets"); // "presets" | "custom" | "monitor"
  const [customAction, setCustomAction] = useState({ actionType: "transfer", amount: "", to: "", contractAddress: "", spender: "", sourceCode: "" });
  const [monitorLog, setMonitorLog] = useState([]);
  const [monitoring, setMonitoring] = useState(false);
  const monitorRef = useState(null);

  // Auto-intercept simulation — generates random agent actions
  const startMonitor = () => {
    setMonitoring(true);
    setMonitorLog([]);
    const actions = [
      { actionType: "approve", payload: { amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935", contractAddress: "0xdead000000000000000000000000000000000000", spender: "0xmalicious000000000000000000000000000000" } },
      { actionType: "transfer", payload: { amount: "10", to: "0xfriend00000000000000000000000000000000", contractAddress: "0x0000000000000000000000000000000000000000", threshold: "100" } },
      { actionType: "deploy_contract", payload: { sourceCode: 'pragma solidity ^0.8.0;\ncontract Unsafe {\n  mapping(address => uint256) public b;\n  function withdraw() public {\n    (bool s,) = msg.sender.call{value: b[msg.sender]}("");\n    require(s);\n    b[msg.sender] = 0;\n  }\n}' } },
      { actionType: "transfer", payload: { amount: "5", to: "0xsafe0000000000000000000000000000000000", contractAddress: "0x0000000000000000000000000000000000000000", threshold: "100" } },
      { actionType: "approve", payload: { amount: "50", contractAddress: "0xtoken00000000000000000000000000000000", spender: "0xdex0000000000000000000000000000000000" } },
    ];
    let i = 0;
    const interval = setInterval(async () => {
      if (i >= actions.length) { clearInterval(interval); setMonitoring(false); return; }
      const action = actions[i];
      setMonitorLog(prev => [...prev, { action, status: "analyzing", timestamp: Date.now() }]);
      try {
        const res = await fetch("/api/agent/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-402-Payment": "demo-payment-token" },
          body: JSON.stringify(action),
        });
        const data = await res.json();
        setMonitorLog(prev => prev.map((item, idx) => idx === prev.length - 1 ? { ...item, result: data, status: "done" } : item));
        addToHistory?.({ type: "auto-guard", riskLevel: data.riskLevel, summary: data.reason, decision: data.decision });
        onAnalysis?.();
      } catch (err) {
        setMonitorLog(prev => prev.map((item, idx) => idx === prev.length - 1 ? { ...item, status: "error", error: err.message } : item));
      }
      i++;
    }, 4000);
    monitorRef[0] = interval;
  };

  const stopMonitor = () => {
    if (monitorRef[0]) clearInterval(monitorRef[0]);
    setMonitoring(false);
  };

  const evaluateCustom = async () => {
    const action = customAction.actionType === "deploy_contract"
      ? { actionType: "deploy_contract", payload: { sourceCode: customAction.sourceCode } }
      : { actionType: customAction.actionType, payload: { amount: customAction.amount, to: customAction.to, contractAddress: customAction.contractAddress, spender: customAction.spender, threshold: "100" } };
    await evaluate({ action });
  };

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
      addToHistory?.({ type: "agent-guard", riskLevel: data.riskLevel, summary: data.reason, decision: data.decision });

      // Flash effect + sound
      setScreenFlash(data.decision === "BLOCK" ? "block" : "allow");
      setTimeout(() => setScreenFlash(null), 1200);

      // Audio feedback
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = 0.15;
        if (data.decision === "BLOCK") {
          osc.frequency.value = 220;
          osc.type = "square";
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } else {
          osc.frequency.value = 880;
          osc.type = "sine";
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch {}


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
        <h2 className="text-lg font-bold gradient-text">{t(lang, "guardTitle")}</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
          {t(lang, "guardDesc")}
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)] w-fit">
        {[
          { id: "presets", labelEs: "Escenarios", labelEn: "Scenarios" },
          { id: "custom", labelEs: "Personalizado", labelEn: "Custom" },
          { id: "monitor", labelEs: "Auto-Monitor", labelEn: "Auto-Monitor" },
        ].map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
            className={`px-4 py-2 text-xs font-mono font-bold transition-all ${
              mode === m.id
                ? "bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            }`}>
            {lang === "es" ? m.labelEs : m.labelEn}
          </button>
        ))}
      </div>

      {/* === MONITOR MODE === */}
      {mode === "monitor" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl glass-card border-[var(--accent-border)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {monitoring && <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />}
                <h3 className="font-mono text-sm font-bold text-[var(--accent)]">
                  {lang === "es" ? "Monitoreo Autónomo" : "Autonomous Monitoring"}
                </h3>
              </div>
              {!monitoring ? (
                <button onClick={startMonitor} className="btn-primary px-4 py-2 rounded-lg text-xs font-mono">
                  {lang === "es" ? "Iniciar Monitor" : "Start Monitor"}
                </button>
              ) : (
                <button onClick={stopMonitor} className="px-4 py-2 rounded-lg text-xs font-mono bg-[var(--red-glow)] border border-[rgba(255,51,85,0.3)] text-[var(--red)]">
                  {lang === "es" ? "Detener" : "Stop"}
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {lang === "es"
                ? "Sentinel intercepta automáticamente acciones de agentes IA. Cada acción es evaluada, bloqueada o permitida, y registrada on-chain sin intervención humana."
                : "Sentinel automatically intercepts AI agent actions. Each action is evaluated, blocked or allowed, and logged on-chain without human intervention."}
            </p>
          </div>

          {/* Monitor log */}
          {monitorLog.length > 0 && (
            <div className="space-y-2">
              {monitorLog.map((entry, i) => (
                <div key={i} className={`p-4 rounded-lg border animate-slideUp ${
                  entry.status === "analyzing" ? "glass-card border-[var(--accent-border)] shield-scan" :
                  entry.result?.decision === "BLOCK" ? "bg-[var(--red-glow)] border-[rgba(255,51,85,0.3)]" :
                  "bg-[var(--accent-glow)] border-[var(--accent-border)]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[var(--text-secondary)]">
                        {lang === "es" ? "Agente" : "Agent"} → <span className="text-[var(--text-primary)]">{entry.action.actionType}</span>
                      </span>
                      {entry.status === "analyzing" && (
                        <span className="text-xs font-mono text-[var(--yellow)] flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          {lang === "es" ? "Analizando..." : "Analyzing..."}
                        </span>
                      )}
                      {entry.result && (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          entry.result.decision === "BLOCK" ? "risk-high" : "risk-low"
                        }`}>
                          {entry.result.decision}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-[var(--text-secondary)]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {entry.result && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{entry.result.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === CUSTOM MODE === */}
      {mode === "custom" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">
                  {lang === "es" ? "Tipo de Acción" : "Action Type"}
                </label>
                <select value={customAction.actionType} onChange={(e) => setCustomAction({ ...customAction, actionType: e.target.value })}
                  className="w-full p-2.5 rounded-lg input-glow text-sm font-mono">
                  <option value="transfer">{t(lang, "transfer")}</option>
                  <option value="approve">{t(lang, "approve")}</option>
                  <option value="deploy_contract">Deploy Contract</option>
                </select>
              </div>
              {customAction.actionType !== "deploy_contract" && (
                <>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "amount")}</label>
                    <input type="text" value={customAction.amount} onChange={(e) => setCustomAction({ ...customAction, amount: e.target.value })}
                      placeholder="100" className="w-full p-2.5 rounded-lg input-glow text-sm font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "contractAddress")}</label>
                    <input type="text" value={customAction.contractAddress} onChange={(e) => setCustomAction({ ...customAction, contractAddress: e.target.value })}
                      placeholder="0x..." className="w-full p-2.5 rounded-lg input-glow text-sm font-mono text-xs" />
                  </div>
                  {customAction.actionType === "approve" && (
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "spenderAddress")}</label>
                      <input type="text" value={customAction.spender} onChange={(e) => setCustomAction({ ...customAction, spender: e.target.value })}
                        placeholder="0x..." className="w-full p-2.5 rounded-lg input-glow text-sm font-mono text-xs" />
                    </div>
                  )}
                  {customAction.actionType === "transfer" && (
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">{t(lang, "recipient")}</label>
                      <input type="text" value={customAction.to} onChange={(e) => setCustomAction({ ...customAction, to: e.target.value })}
                        placeholder="0x..." className="w-full p-2.5 rounded-lg input-glow text-sm font-mono text-xs" />
                    </div>
                  )}
                </>
              )}
              {customAction.actionType === "deploy_contract" && (
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-mono">Solidity Code</label>
                  <textarea value={customAction.sourceCode} onChange={(e) => setCustomAction({ ...customAction, sourceCode: e.target.value })}
                    placeholder="pragma solidity ^0.8.0;..." className="w-full p-3 h-40 rounded-lg input-glow text-xs font-mono" />
                </div>
              )}
              <button onClick={evaluateCustom} disabled={loading} className="btn-primary px-6 py-2.5 rounded-lg font-mono text-sm w-full">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    {t(lang, "evaluating")}
                  </span>
                ) : (lang === "es" ? "Evaluar Acción" : "Evaluate Action")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === PRESETS MODE === Scenarios */}
      {mode === "presets" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS_DATA.map((scenario, i) => {
          const style = SCENARIO_STYLES[i];
          return (
            <button
              key={i}
              onClick={() => evaluate(scenario)}
              disabled={loading}
              className={`scenario-card ${style.className} p-6 rounded-xl text-left border ${
                selectedScenario === scenario
                  ? "bg-[var(--accent-glow)] border-[var(--accent-border)]"
                  : "bg-[var(--bg-card)] border-[var(--border-color)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${style.iconBg} border flex items-center justify-center mb-4 ${style.iconColor}`}>
                {style.icon}
              </div>
              {/* Label */}
              <h3 className="font-semibold text-sm mb-1.5 text-[var(--text-primary)]">
                {i === 0 ? t(lang, "deployVulnerable") : i === 1 ? t(lang, "unlimitedApprove") : t(lang, "safeTransfer")}
              </h3>
              <p className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)] opacity-50" />
                {scenario.action.actionType}
              </p>
            </button>
          );
        })}
      </div>
      )}

      {/* Loading — Shield scan */}
      {loading && <ShieldScanOverlay lang={lang} />}

      {/* Result */}
      {result && !result.error && !loading && (
        <div className="space-y-4 animate-slideUp">
          {/* Decision Banner */}
          <div className={`p-8 rounded-2xl text-center ${
            result.decision === "BLOCK"
              ? "block-banner animate-shake"
              : "allow-banner"
          }`}>
            {/* Large icon */}
            <div className={`text-6xl mb-4 ${result.decision === "BLOCK" ? "animate-pop" : "animate-pop"}`}>
              {result.decision === "BLOCK" ? (
                <svg className="w-16 h-16 mx-auto text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              ) : (
                <svg className="w-16 h-16 mx-auto text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              )}
            </div>
            <h3 className={`text-4xl font-black font-mono tracking-[0.2em] ${
              result.decision === "BLOCK" ? "gradient-text-fire" : "gradient-text"
            }`}>
              {result.decision === "BLOCK" ? t(lang, "actionBlocked") : t(lang, "actionAllowed")}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-md mx-auto">{result.reason}</p>
            <span className={`inline-block mt-4 px-4 py-1.5 rounded-lg text-sm font-medium risk-${result.riskLevel.toLowerCase()} ${
              result.riskLevel === "HIGH" ? "risk-pulse" : ""
            }`}>
              {t(lang, "risk")}: {result.riskLevel}
            </span>
          </div>

          {/* Findings — animate in one by one */}
          {result.findings?.length > 0 && (
            <div className="space-y-2 stagger-children">
              {result.findings.map((f, i) => (
                <div key={i} className={`p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] card-glow finding-${f.severity.toLowerCase()}`}>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()}`}>
                      {f.severity}
                    </span>
                    <span className="font-medium text-sm text-[var(--text-primary)]">{f.name}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mt-1.5 pl-0.5">{f.detail || f.warning}</p>
                </div>
              ))}
            </div>
          )}

          {/* On-chain proof */}
          {result.onChain && (
            <div className="p-5 rounded-xl bg-green-500/8 border border-green-500/20 animate-slideUp" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 pulse-dot" />
                <h3 className="font-semibold text-sm text-green-300">{t(lang, "loggedOnChain")}</h3>
              </div>
              <a href={result.onChain.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs transition-colors">
                {result.onChain.txHash}
              </a>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                Entry #{result.onChain.entryId} — {t(lang, "reputationUpdated")}
              </p>
              {result.onChain.gasUsed && result.onChain.gasUsed !== "N/A" && (
                <p className="text-xs font-mono text-[var(--yellow)] mt-1.5 pt-1.5 border-t border-[var(--border-color)]">
                  Gas: {Number(result.onChain.gasUsed).toLocaleString()} | {result.onChain.gasCost}
                </p>
              )}
            </div>
          )}

          {/* EncryptedERC */}
          <div className="p-4 rounded-xl bg-purple-500/8 border border-purple-500/20 animate-slideUp" style={{ animationDelay: "0.35s" }}>
            <h3 className="font-semibold text-sm mb-2 text-purple-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              EncryptedERC
            </h3>
            <div className="space-y-1 text-xs font-mono text-[var(--text-secondary)]">
              <p>{lang === "es" ? "Algoritmo" : "Algorithm"}: <span className="text-purple-300">AES-256-GCM</span></p>
              <p>{lang === "es" ? "Estado" : "Status"}: <span className="text-[var(--accent)]">{lang === "es" ? "Reporte encriptado on-chain" : "Report encrypted on-chain"}</span></p>
            </div>
          </div>

          {/* Payment */}
          <X402Tooltip cost="0.001" lang={lang} />
        </div>
      )}

      {result?.error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-slideUp">
          {t(lang, "error")}: {result.error}
        </div>
      )}
    </div>
  );
}
