import { useState, useEffect } from "react";
import { t } from "../i18n.js";
import { SentinelLogoLarge } from "./SentinelLogo.jsx";

// Simulated terminal typing animation
function TerminalTyping({ lines, speed = 40 }) {
  const [displayed, setDisplayed] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) return;
    const line = lines[currentLine];
    if (currentChar < line.text.length) {
      const timer = setTimeout(() => setCurrentChar(c => c + 1), speed);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayed(d => [...d, line]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, lines, speed]);

  const activeLine = currentLine < lines.length ? lines[currentLine] : null;

  return (
    <div className="font-mono text-xs leading-relaxed">
      {displayed.map((line, i) => (
        <div key={i} className={line.color || "text-[var(--text-secondary)]"}>
          {line.prefix && <span className="text-[var(--accent)]">{line.prefix}</span>}
          {line.text}
        </div>
      ))}
      {activeLine && (
        <div className={activeLine.color || "text-[var(--text-secondary)]"}>
          {activeLine.prefix && <span className="text-[var(--accent)]">{activeLine.prefix}</span>}
          {activeLine.text.substring(0, currentChar)}
          <span className="typing-cursor" />
        </div>
      )}
    </div>
  );
}

// Animated shield scanner
function ShieldScanner() {
  return (
    <div className="relative w-full h-36 rounded-xl bg-[#060a0e] border border-[var(--border-color)] overflow-hidden glass-card">
      {/* Scan line */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60"
          style={{ animation: "scanDown 2s ease-in-out infinite" }} />
      </div>
      {/* Code lines being scanned */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-40 w-4 text-right">01</span>
          <span className="text-[11px] font-mono text-[var(--red)]">function withdraw() public {"{"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-40 w-4 text-right">02</span>
          <span className="text-[11px] font-mono text-[var(--yellow)]">  msg.sender.call{"{"}value: bal{"}"}("");</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-40 w-4 text-right">03</span>
          <span className="text-[11px] font-mono text-[var(--red)]">  balances[msg.sender] = 0; <span className="text-[var(--text-secondary)] opacity-50">// AFTER call</span></span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--red-glow)] text-[var(--red)] border border-[rgba(255,51,85,0.3)] risk-pulse">
            REENTRANCY DETECTED
          </span>
        </div>
      </div>
      <style>{`@keyframes scanDown { 0%,100% { top: 0; } 50% { top: 100%; } }`}</style>
    </div>
  );
}

// Animated block/allow decision
function DecisionAnimation() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 4), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-36 rounded-xl bg-[#060a0e] border border-[var(--border-color)] overflow-hidden flex items-center justify-center glass-card">
      <div className="text-center animate-pop" key={phase}>
        {phase === 0 && (
          <div>
            <div className="text-xs font-mono text-[var(--text-secondary)] mb-2">AI Agent → approve(MAX_UINT256)</div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)] animate-bounce" />
              <span className="text-xs font-mono text-[var(--yellow)]">analyzing...</span>
            </div>
          </div>
        )}
        {phase === 1 && (
          <div>
            <div className="text-3xl font-mono font-black gradient-text-fire tracking-[0.15em]">BLOCKED</div>
            <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-2">unlimited approval → HIGH risk</div>
          </div>
        )}
        {phase === 2 && (
          <div>
            <div className="text-xs font-mono text-[var(--text-secondary)] mb-2">AI Agent → transfer(10 USDC)</div>
            <div className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--yellow)] animate-bounce" />
              <span className="text-xs font-mono text-[var(--yellow)]">analyzing...</span>
            </div>
          </div>
        )}
        {phase === 3 && (
          <div>
            <div className="text-3xl font-mono font-black gradient-text tracking-[0.15em]">ALLOWED</div>
            <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-2">safe transfer → LOW risk</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reputation counter
function ReputationCounter() {
  const [score, setScore] = useState(0);
  const [blocks, setBlocks] = useState(0);
  const [allows, setAllows] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const isBlock = Math.random() > 0.4;
      if (isBlock) {
        setScore(s => s + 10);
        setBlocks(b => b + 1);
      } else {
        setScore(s => s + 5);
        setAllows(a => a + 1);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-36 rounded-xl bg-[#060a0e] border border-[var(--border-color)] p-5 flex items-center justify-around glass-card">
      <div className="text-center">
        <div className="text-3xl font-mono font-bold gradient-text">{score}</div>
        <div className="text-[9px] font-mono text-[var(--text-secondary)] mt-1">REPUTATION</div>
      </div>
      <div className="w-px h-14 bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent" />
      <div className="text-center">
        <div className="text-3xl font-mono font-bold text-[var(--red)]">{blocks}</div>
        <div className="text-[9px] font-mono text-[var(--text-secondary)] mt-1">BLOCKED</div>
      </div>
      <div className="w-px h-14 bg-gradient-to-b from-transparent via-[var(--border-color)] to-transparent" />
      <div className="text-center">
        <div className="text-3xl font-mono font-bold text-[var(--accent)]">{allows}</div>
        <div className="text-[9px] font-mono text-[var(--text-secondary)] mt-1">ALLOWED</div>
      </div>
    </div>
  );
}

const FEATURES_ES = [
  {
    title: "Analiza Smart Contracts",
    desc: "Escanea codigo Solidity linea por linea. Detecta reentrancy, approvals ilimitados, tx.origin, y mas — antes de que se deployen.",
    tag: "CONTRACT ANALYZER",
  },
  {
    title: "Bloquea Acciones Riesgosas",
    desc: "Cuando un AI agent intenta ejecutar algo peligroso, Sentinel lo intercepta y decide: BLOCK o ALLOW. Cada decision se registra on-chain.",
    tag: "AGENT GUARD",
  },
  {
    title: "Construye Reputacion On-Chain",
    desc: "Cada decision correcta sube el score. Registrado como agente ERC-8004 en Avalanche. Reputacion verificable por cualquiera.",
    tag: "ERC-8004 IDENTITY",
  },
];

const FEATURES_EN = [
  {
    title: "Analyze Smart Contracts",
    desc: "Scans Solidity code line by line. Detects reentrancy, unlimited approvals, tx.origin abuse, and more — before they deploy.",
    tag: "CONTRACT ANALYZER",
  },
  {
    title: "Block Risky Actions",
    desc: "When an AI agent tries to execute something dangerous, Sentinel intercepts and decides: BLOCK or ALLOW. Every decision is logged on-chain.",
    tag: "AGENT GUARD",
  },
  {
    title: "Build On-Chain Reputation",
    desc: "Every correct decision increases the score. Registered as an ERC-8004 agent on Avalanche. Reputation verifiable by anyone.",
    tag: "ERC-8004 IDENTITY",
  },
];

export default function LandingPage({ onEnter, lang = "es" }) {
  const features = lang === "es" ? FEATURES_ES : FEATURES_EN;
  const animations = [<ShieldScanner />, <DecisionAnimation />, <ReputationCounter />];

  const terminalLines = lang === "es" ? [
    { prefix: "$ ", text: "sentinel analyze --contract vulnerable.sol", color: "text-[var(--text-primary)]" },
    { prefix: "", text: "[SCAN] Reentrancy detectada en linea 13", color: "text-[var(--red)]" },
    { prefix: "", text: "[BLOCK] Accion bloqueada → registrado en Fuji", color: "text-[var(--yellow)]" },
    { prefix: "", text: "[REP] Score actualizado: +10 puntos", color: "text-[var(--accent)]" },
    { prefix: "", text: "[x402] Pago recibido: $0.001 USDC", color: "text-[var(--accent)]" },
    { prefix: "$ ", text: "_", color: "text-[var(--text-primary)]" },
  ] : [
    { prefix: "$ ", text: "sentinel analyze --contract vulnerable.sol", color: "text-[var(--text-primary)]" },
    { prefix: "", text: "[SCAN] Reentrancy detected at line 13", color: "text-[var(--red)]" },
    { prefix: "", text: "[BLOCK] Action blocked → logged on Fuji", color: "text-[var(--yellow)]" },
    { prefix: "", text: "[REP] Score updated: +10 points", color: "text-[var(--accent)]" },
    { prefix: "", text: "[x402] Payment received: $0.001 USDC", color: "text-[var(--accent)]" },
    { prefix: "$ ", text: "_", color: "text-[var(--text-primary)]" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] relative overflow-hidden">
      {/* Particle grid bg */}
      <div className="particle-grid" />

      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.04] rounded-full blur-[150px]" />
      {/* Secondary glow */}
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--blue)] opacity-[0.02] rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center space-y-8">
          <div className="animate-float">
            <SentinelLogoLarge />
          </div>
          <h1 className="text-5xl md:text-7xl font-black gradient-text tracking-tight"
            style={{ textShadow: "0 0 60px var(--accent-glow)" }}>
            SENTINEL AI
          </h1>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-[var(--accent-border)]" />
            <p className="text-sm font-mono text-[var(--text-secondary)]">{t(lang, "landingSubtitle")}</p>
            <span className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-[var(--accent-border)]" />
          </div>

          {/* Terminal preview */}
          <div className="w-full max-w-lg rounded-xl glass-card overflow-hidden hover:border-[var(--accent-border)] transition-all">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border-color)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--red)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--yellow)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              <span className="text-[10px] font-mono text-[var(--text-secondary)] ml-2">sentinel-ai</span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
            </div>
            <div className="p-5 bg-[#060a0e]">
              <TerminalTyping lines={terminalLines} speed={35} />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {["ERC-8004", "x402", "EncryptedERC", "Avalanche"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg font-mono text-xs border border-[var(--accent-border)] text-[var(--accent)] bg-[var(--accent-glow)] hover:bg-[rgba(0,255,136,0.2)] transition-all cursor-default">
                [{tag}]
              </span>
            ))}
          </div>

          {/* CTA button */}
          <button onClick={onEnter} className="group btn-primary px-12 py-4 rounded-xl text-base font-mono tracking-wider relative overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              {t(lang, "enterApp")}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>

          {/* Scroll indicator */}
          <div className="pt-6 text-[var(--text-secondary)] text-xs font-mono animate-bounce flex flex-col items-center gap-1">
            <span>scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 space-y-24">
          {features.map((feature, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-10 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
              {/* Text */}
              <div className="flex-1 space-y-4">
                <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-mono font-bold border border-[var(--accent-border)] text-[var(--accent)] bg-[var(--accent-glow)]">
                  {feature.tag}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{feature.title}</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono">{feature.desc}</p>
              </div>
              {/* Animation */}
              <div className="flex-1 w-full">{animations[i]}</div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="py-24 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold font-mono gradient-text">
            {lang === "es" ? "Listo para proteger Web3?" : "Ready to protect Web3?"}
          </h2>
          <button onClick={onEnter} className="group btn-primary px-14 py-5 rounded-xl text-lg font-mono tracking-wider">
            <span className="flex items-center gap-2">
              {t(lang, "enterApp")}
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />
            {t(lang, "liveOn")}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-[10px] font-mono text-[var(--text-secondary)] opacity-40">
          Avalanche — Aleph Hackathon 2026
        </footer>
      </div>
    </div>
  );
}
