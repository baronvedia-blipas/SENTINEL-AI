import { useState } from "react";

const STEPS_ES = [
  {
    phase: "EL PROBLEMA",
    title: "Web3 es peligroso sin supervisión",
    desc: "Los usuarios firman transacciones a ciegas. Los AI agents ejecutan acciones sin que nadie las revise. Los hacks en DeFi han causado pérdidas de más de $3 billones.",
    action: null,
  },
  {
    phase: "PASO 1",
    title: "Analizar un contrato vulnerable",
    desc: "Un desarrollador quiere deployar este contrato. Sentinel lo escanea automáticamente y detecta una vulnerabilidad de reentrancy — el mismo bug que causó el hack de The DAO ($60M).",
    action: {
      type: "contract",
      endpoint: "/api/analyze/contract",
      body: { sourceCode: `pragma solidity ^0.8.0;\ncontract VulnerableVault {\n    mapping(address => uint256) public deposits;\n    function deposit() public payable {\n        deposits[msg.sender] += msg.value;\n    }\n    function withdrawAll() public {\n        uint256 amount = deposits[msg.sender];\n        (bool success, ) = msg.sender.call{value: amount}("");\n        require(success);\n        deposits[msg.sender] = 0;\n    }\n}`, lang: "es" },
    },
  },
  {
    phase: "PASO 2",
    title: "Bloquear una transacción peligrosa",
    desc: "Un AI agent intenta aprobar gasto ILIMITADO de tokens a una dirección desconocida. Sentinel intercepta la acción y la BLOQUEA antes de que se ejecute.",
    action: {
      type: "agent",
      endpoint: "/api/agent/evaluate",
      body: { actionType: "approve", payload: { amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935", contractAddress: "0xdead000000000000000000000000000000000000", spender: "0xmalicious000000000000000000000000000000" } },
    },
  },
  {
    phase: "PASO 3",
    title: "Permitir una acción segura",
    desc: "El mismo AI agent ahora quiere enviar 10 USDC a un amigo. Sentinel lo analiza y lo PERMITE — demuestra que tiene criterio, no solo bloquea todo.",
    action: {
      type: "agent",
      endpoint: "/api/agent/evaluate",
      body: { actionType: "transfer", payload: { amount: "10", to: "0xfriend00000000000000000000000000000000", contractAddress: "0x0000000000000000000000000000000000000000", threshold: "100" } },
    },
  },
  {
    phase: "EL IMPACTO",
    title: "Reputación verificable on-chain",
    desc: "Cada decisión queda registrada en Avalanche Fuji. El score de reputación sube. Cualquier persona puede verificar el historial de Sentinel en Snowtrace. Es un agente con identidad, modelo de negocio, y track record público.",
    action: null,
  },
];

const STEPS_EN = [
  {
    phase: "THE PROBLEM",
    title: "Web3 is dangerous without oversight",
    desc: "Users sign transactions blindly. AI agents execute actions without review. DeFi hacks have caused over $3 billion in losses.",
    action: null,
  },
  {
    phase: "STEP 1",
    title: "Analyze a vulnerable contract",
    desc: "A developer wants to deploy this contract. Sentinel scans it automatically and detects a reentrancy vulnerability — the same bug that caused The DAO hack ($60M).",
    action: STEPS_ES[1].action,
  },
  {
    phase: "STEP 2",
    title: "Block a dangerous transaction",
    desc: "An AI agent tries to approve UNLIMITED token spending to an unknown address. Sentinel intercepts the action and BLOCKS it before execution.",
    action: STEPS_ES[2].action,
  },
  {
    phase: "STEP 3",
    title: "Allow a safe action",
    desc: "The same AI agent wants to send 10 USDC to a friend. Sentinel analyzes it and ALLOWS it — proving it has judgment, not just blocking everything.",
    action: STEPS_ES[3].action,
  },
  {
    phase: "THE IMPACT",
    title: "Verifiable on-chain reputation",
    desc: "Every decision is logged on Avalanche Fuji. The reputation score increases. Anyone can verify Sentinel's history on Snowtrace. It's an agent with identity, business model, and public track record.",
    action: null,
  },
];

export default function GuidedDemo({ lang = "es", onAnalysis }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState({});
  const [loading, setLoading] = useState(false);

  const steps = lang === "es" ? STEPS_ES : STEPS_EN;
  const step = steps[currentStep];

  const runStep = async () => {
    if (!step.action) return;
    setLoading(true);
    try {
      const res = await fetch(step.action.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-402-Payment": "demo-payment-token" },
        body: JSON.stringify(step.action.body),
      });
      const data = await res.json();
      setStepResults(prev => ({ ...prev, [currentStep]: data }));
      onAnalysis?.();
    } catch (err) {
      setStepResults(prev => ({ ...prev, [currentStep]: { error: err.message } }));
    } finally {
      setLoading(false);
    }
  };

  const result = stepResults[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-1">
            <button onClick={() => setCurrentStep(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                i === currentStep ? "bg-[var(--accent)] text-[var(--bg-dark)] scale-110" :
                i < currentStep || stepResults[i] ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent-border)]" :
                "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]"
              }`}>
              {stepResults[i] ? "✓" : i + 1}
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded ${
                i < currentStep ? "bg-[var(--accent)]" : "bg-[var(--border-color)]"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div className="p-6 rounded-2xl glass-card animate-slideUp" key={currentStep}>
        <span className="px-3 py-1 rounded-lg text-[10px] font-mono font-bold bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent-border)]">
          {step.phase}
        </span>
        <h2 className="text-2xl font-bold mt-3 mb-2 gradient-text">{step.title}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">{step.desc}</p>

        {/* Action button */}
        {step.action && !result && (
          <button onClick={runStep} disabled={loading}
            className="btn-primary px-8 py-3 rounded-lg font-mono text-sm mt-5 flex items-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {lang === "es" ? "Ejecutando..." : "Running..."}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                {lang === "es" ? "Ejecutar paso" : "Run step"}
              </>
            )}
          </button>
        )}

        {/* Result */}
        {result && !result.error && (
          <div className="mt-5 space-y-3 animate-slideUp">
            <div className="flex items-center gap-3">
              {(result.decision === "BLOCK" || result.riskLevel === "HIGH") ? (
                <span className="px-4 py-2 rounded-lg font-bold text-lg risk-high risk-pulse">
                  {result.decision || "BLOCK"}
                </span>
              ) : (
                <span className="px-4 py-2 rounded-lg font-bold text-lg risk-low">
                  {result.decision || "ALLOW"}
                </span>
              )}
              <span className="text-sm text-[var(--text-secondary)]">{result.reason || result.summary}</span>
            </div>

            {result.onChain && (
              <div className="p-3 rounded-lg bg-green-500/8 border border-green-500/20 text-xs">
                <span className="text-green-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                  {lang === "es" ? "Registrado en Avalanche Fuji" : "Logged on Avalanche Fuji"}
                </span>
                <a href={result.onChain.explorerUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-mono text-[10px] mt-1 block">
                  {result.onChain.txHash}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
          className="btn-hack px-5 py-2 rounded-lg text-xs font-mono disabled:opacity-30">
          ← {lang === "es" ? "Anterior" : "Previous"}
        </button>
        <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1}
          className="btn-primary px-5 py-2 rounded-lg text-xs font-mono disabled:opacity-30">
          {lang === "es" ? "Siguiente" : "Next"} →
        </button>
      </div>
    </div>
  );
}
