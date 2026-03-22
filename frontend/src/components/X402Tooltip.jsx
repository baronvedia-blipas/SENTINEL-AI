import { useState } from "react";

const EXPLANATIONS = {
  es: {
    title: "Protocolo x402 — Micropagos",
    line1: "Cada análisis tiene un costo real pagado via el protocolo x402.",
    line2: "x402 es un estándar de micropagos Web3 que permite cobrar por llamada API sin suscripciones.",
    line3: "El pago se verifica en cada request mediante el header X-402-Payment.",
    how: "¿Cómo funciona?",
    step1: "1. Cliente envía request con header de pago",
    step2: "2. Servidor verifica el pago ($0.001 USDC)",
    step3: "3. Si es válido → ejecuta el análisis",
    step4: "4. Si no hay pago → responde 402 Payment Required",
  },
  en: {
    title: "x402 Protocol — Micropayments",
    line1: "Each analysis has a real cost paid via the x402 protocol.",
    line2: "x402 is a Web3 micropayment standard that enables pay-per-API-call without subscriptions.",
    line3: "Payment is verified on each request via the X-402-Payment header.",
    how: "How does it work?",
    step1: "1. Client sends request with payment header",
    step2: "2. Server verifies payment ($0.001 USDC)",
    step3: "3. If valid → executes analysis",
    step4: "4. If no payment → responds 402 Payment Required",
  },
};

export default function X402Tooltip({ cost, lang = "es" }) {
  const [open, setOpen] = useState(false);
  const txt = EXPLANATIONS[lang] || EXPLANATIONS.en;

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-xs group cursor-help"
      >
        <span className="text-[var(--text-secondary)]">[x402]</span>
        <span className="text-[var(--accent)] font-bold">${cost} USDC</span>
        <span className="text-[var(--accent)] font-bold">{lang === "es" ? "verificado" : "verified"}</span>
        <span className="w-3.5 h-3.5 rounded-full border border-[var(--accent-border)] text-[var(--accent)] text-[9px] flex items-center justify-center group-hover:bg-[var(--accent-glow)] transition-colors">
          ?
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-72 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--accent-border)] shadow-xl shadow-[rgba(0,255,136,0.1)] z-50 animate-pop">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-[var(--accent)]">{txt.title}</span>
              <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs">✕</button>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-2">{txt.line1}</p>
            <p className="text-[11px] text-[var(--text-secondary)] mb-2">{txt.line2}</p>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">{txt.line3}</p>
            <div className="border-t border-[var(--border-color)] pt-3">
              <span className="text-[10px] font-mono font-bold text-[var(--accent)] mb-2 block">{txt.how}</span>
              <div className="space-y-1 text-[10px] font-mono text-[var(--text-secondary)]">
                <div>{txt.step1}</div>
                <div>{txt.step2}</div>
                <div className="text-[var(--accent)]">{txt.step3}</div>
                <div className="text-[var(--red)]">{txt.step4}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </span>
  );
}
