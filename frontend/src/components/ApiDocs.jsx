import { useState } from "react";
import { t } from "../i18n.js";

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/analyze/contract",
    cost: "$0.001",
    descEs: "Analiza código Solidity para detectar vulnerabilidades",
    descEn: "Analyze Solidity code to detect vulnerabilities",
    bodyExample: JSON.stringify({ sourceCode: 'pragma solidity ^0.8.0;\ncontract Example {\n  function withdraw() public {\n    (bool s,) = msg.sender.call{value: 1}("");\n    balances[msg.sender] = 0;\n  }\n}', lang: "es" }, null, 2),
    headers: { "Content-Type": "application/json", "X-402-Payment": "payment-token" },
  },
  {
    method: "POST",
    path: "/api/analyze/transaction",
    cost: "$0.0005",
    descEs: "Analiza una transacción antes de ejecutarla",
    descEn: "Analyze a transaction before execution",
    bodyExample: JSON.stringify({ type: "approve", amount: "115792089237316195423570985008687907853269984665640564039457584007913129639935", contractAddress: "0xdead...", spender: "0xattacker...", lang: "es" }, null, 2),
    headers: { "Content-Type": "application/json", "X-402-Payment": "payment-token" },
  },
  {
    method: "POST",
    path: "/api/agent/evaluate",
    cost: "$0.001",
    descEs: "Evalúa una acción de un agente IA — BLOCK o ALLOW",
    descEn: "Evaluate an AI agent action — BLOCK or ALLOW",
    bodyExample: JSON.stringify({ actionType: "deploy_contract", payload: { sourceCode: "pragma solidity ^0.8.0; contract Unsafe { ... }" } }, null, 2),
    headers: { "Content-Type": "application/json", "X-402-Payment": "payment-token" },
  },
  {
    method: "GET",
    path: "/api/agent/identity",
    cost: null,
    descEs: "Obtiene la identidad ERC-8004 del agente",
    descEn: "Get the ERC-8004 agent identity",
    bodyExample: null,
    headers: {},
  },
  {
    method: "GET",
    path: "/api/agent/reputation",
    cost: null,
    descEs: "Obtiene el score de reputación del agente",
    descEn: "Get the agent's reputation score",
    bodyExample: null,
    headers: {},
  },
  {
    method: "GET",
    path: "/api/audit-log?count=10",
    cost: null,
    descEs: "Obtiene las últimas entradas del registro de auditoría on-chain",
    descEn: "Get the latest on-chain audit log entries",
    bodyExample: null,
    headers: {},
  },
  {
    method: "GET",
    path: "/api/health",
    cost: null,
    descEs: "Estado del agente, balance AVAX, y direcciones de contratos",
    descEn: "Agent status, AVAX balance, and contract addresses",
    bodyExample: null,
    headers: {},
  },
  {
    method: "GET",
    path: "/api/pricing",
    cost: null,
    descEs: "Información de precios del protocolo x402",
    descEn: "x402 protocol pricing information",
    bodyExample: null,
    headers: {},
  },
];

export default function ApiDocs({ lang = "es" }) {
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const tryEndpoint = async (endpoint) => {
    setSelected(endpoint.path);
    setLoading(true);
    setResponse(null);
    try {
      const options = { method: endpoint.method };
      if (endpoint.method === "POST") {
        options.headers = endpoint.headers;
        options.body = endpoint.bodyExample;
      }
      const res = await fetch(endpoint.path.split("?")[0] + (endpoint.path.includes("?") ? "?" + endpoint.path.split("?")[1] : ""), options);
      const data = await res.json();
      setResponse({ status: res.status, data });
    } catch (err) {
      setResponse({ status: "error", data: { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold gradient-text">API Reference</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {lang === "es"
            ? "Endpoints REST del agente Sentinel AI. Los endpoints pagados requieren el header X-402-Payment."
            : "Sentinel AI agent REST endpoints. Paid endpoints require the X-402-Payment header."}
        </p>
      </div>

      {/* Base URL */}
      <div className="p-3 rounded-lg bg-[#060a0e] border border-[var(--border-color)] font-mono text-xs">
        <span className="text-[var(--text-secondary)]">Base URL: </span>
        <span className="text-[var(--accent)]">{window.location.origin}/api</span>
      </div>

      {/* Endpoints */}
      <div className="space-y-3">
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] card-glow overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
              onClick={() => setSelected(selected === ep.path ? null : ep.path)}>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  ep.method === "POST" ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent-border)]"
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-sm text-[var(--text-primary)]">{ep.path}</span>
                {ep.cost && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[rgba(255,204,0,0.08)] text-[var(--yellow)] border border-[rgba(255,204,0,0.2)]">
                    {ep.cost} USDC
                  </span>
                )}
                {!ep.cost && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent-border)]">
                    FREE
                  </span>
                )}
              </div>
              <svg className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${selected === ep.path ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {/* Expanded */}
            {selected === ep.path && (
              <div className="border-t border-[var(--border-color)] p-4 space-y-4 animate-slideUp">
                <p className="text-sm text-[var(--text-secondary)]">{lang === "es" ? ep.descEs : ep.descEn}</p>

                {/* Headers */}
                {ep.cost && (
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[var(--text-secondary)] mb-2">HEADERS</h4>
                    <div className="p-3 rounded-lg bg-[#060a0e] font-mono text-xs space-y-1">
                      {Object.entries(ep.headers).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-purple-300">{k}</span>
                          <span className="text-[var(--text-secondary)]">: </span>
                          <span className="text-[var(--accent)]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body */}
                {ep.bodyExample && (
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[var(--text-secondary)] mb-2">BODY</h4>
                    <pre className="p-3 rounded-lg bg-[#060a0e] font-mono text-xs text-[var(--yellow)] overflow-x-auto max-h-40">
                      {ep.bodyExample}
                    </pre>
                  </div>
                )}

                {/* Try it */}
                <button onClick={() => tryEndpoint(ep)} disabled={loading}
                  className="btn-hack px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2">
                  {loading && selected === ep.path ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {lang === "es" ? "Ejecutando..." : "Running..."}
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                      {lang === "es" ? "Probar endpoint" : "Try endpoint"}
                    </>
                  )}
                </button>

                {/* Response */}
                {response && selected === ep.path && (
                  <div>
                    <h4 className="text-[10px] font-mono font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                      RESPONSE
                      <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                        response.status === 200 ? "bg-[var(--accent-glow)] text-[var(--accent)]" :
                        response.status === 402 ? "bg-[rgba(255,204,0,0.1)] text-[var(--yellow)]" :
                        "bg-[var(--red-glow)] text-[var(--red)]"
                      }`}>
                        {response.status}
                      </span>
                    </h4>
                    <pre className="p-3 rounded-lg bg-[#060a0e] font-mono text-xs text-[var(--accent)] overflow-x-auto max-h-60 overflow-y-auto">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
