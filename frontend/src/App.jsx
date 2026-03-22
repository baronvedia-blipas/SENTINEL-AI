import { useState, useEffect } from "react";
import ContractAnalyzer from "./components/ContractAnalyzer.jsx";
import TxAnalyzer from "./components/TxAnalyzer.jsx";
import AgentGuard from "./components/AgentGuard.jsx";
import AuditLog from "./components/AuditLog.jsx";
import ApiDocs from "./components/ApiDocs.jsx";
import LandingPage from "./components/LandingPage.jsx";
import useWallet from "./hooks/useWallet.js";
import { t } from "./i18n.js";
import SentinelLogo from "./components/SentinelLogo.jsx";

const API = "/api";
const AGENT_ADDRESS = "0x567FCdC8e7148a60b91F3367D09EB1b23aF413aC";

const TAB_KEYS = [
  { id: "contract", key: "contractAnalyzer", icon: "◆" },
  { id: "transaction", key: "txAnalyzer", icon: "◇" },
  { id: "agent", key: "agentGuard", icon: "■" },
  { id: "log", key: "auditLog", icon: "≡" },
  { id: "api", key: "apiDocs", icon: "⟩" },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState("contract");
  const [agentInfo, setAgentInfo] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [health, setHealth] = useState(null);
  const [lang, setLang] = useState("es");
  const [langCooldown, setLangCooldown] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  const addToHistory = (entry) => {
    setSessionHistory(prev => [{ ...entry, timestamp: Date.now() }, ...prev].slice(0, 20));
  };

  const wallet = useWallet();
  const isOwner = wallet.address?.toLowerCase() === AGENT_ADDRESS.toLowerCase();

  const toggleLang = () => {
    if (langCooldown) return;
    setLang(prev => prev === "es" ? "en" : "es");
    setLangCooldown(true);
    setTimeout(() => setLangCooldown(false), 1000);
  };

  const refreshAll = () => {
    fetch(`${API}/agent/identity`).then(r => r.json()).then(setAgentInfo).catch(() => {});
    fetch(`${API}/agent/reputation`).then(r => r.json()).then(setReputation).catch(() => {});
    fetch(`${API}/health`).then(r => r.json()).then(setHealth).catch(() => {});
  };

  useEffect(() => { refreshAll(); }, []);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} lang={lang} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Matrix background */}
      <div className="matrix-bg" />

      {/* Header */}
      <header className="relative z-10 border-b border-[var(--border-color)] px-3 sm:px-6 py-2 sm:py-3 glass-card" style={{ borderRadius: 0 }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowLanding(true)}>
            <SentinelLogo size={28} glow={true} />
            <div>
              <h1 className="text-base font-bold tracking-wider gradient-text group-hover:text-white transition-colors">
                SENTINEL AI
              </h1>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                {t(lang, "subtitle")}
              </p>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-xs">
            {reputation && (
              <>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-border)] animate-glowPulse">
                  <span className="text-[var(--text-secondary)]">REP </span>
                  <span className="text-[var(--accent)] font-bold">{reputation.score}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--red-glow)] border border-[rgba(255,51,85,0.25)]">
                  <span className="text-[var(--text-secondary)]">BLK </span>
                  <span className="text-[var(--red)] font-bold">{reputation.blockedThreats}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-border)]">
                  <span className="text-[var(--text-secondary)]">ALW </span>
                  <span className="text-[var(--accent)] font-bold">{reputation.allowedSafe}</span>
                </div>
                {health && (
                  <div className="px-3 py-1.5 rounded-lg bg-[rgba(255,204,0,0.08)] border border-[rgba(255,204,0,0.2)]">
                    <span className="text-[var(--text-secondary)]">GAS </span>
                    <span className="text-[var(--yellow)] font-bold">{parseFloat(health.balance).toFixed(3)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-2 mr-1">
              {agentInfo?.active ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--accent-border)] text-[var(--accent)] bg-[var(--accent-glow)] animate-glowPulse cursor-help"
                  title={lang === "es" ? "Agente verificado on-chain en Avalanche Fuji" : "Agent verified on-chain on Avalanche Fuji"}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  ERC-8004
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border-color)] text-[var(--text-secondary)]">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ERC-8004
                </span>
              )}
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--red-glow)] text-[var(--red)] bg-[var(--red-glow)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] pulse-dot" />
                FUJI
              </span>
            </div>

            {/* Lang */}
            <button onClick={toggleLang} disabled={langCooldown}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                langCooldown ? "opacity-40 cursor-not-allowed" : "hover:border-[var(--accent-border)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]"
              } border-[var(--border-color)] text-[var(--text-secondary)]`}>
              {lang === "es" ? "ES" : "EN"}
            </button>

            {/* Wallet */}
            {wallet.address ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono border-[var(--accent-border)] bg-[var(--accent-glow)] text-[var(--accent)]">
                  <span className="text-base">🦊</span>
                  {wallet.shortAddress}
                  {isOwner && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[var(--accent)] text-[var(--bg-dark)]">
                      OWNER
                    </span>
                  )}
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg glass-card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-3 py-2 border-b border-[var(--border-color)]">
                    <div className="text-[10px] font-mono text-[var(--text-secondary)] break-all">{wallet.address}</div>
                  </div>
                  <a href={`https://testnet.snowtrace.io/address/${wallet.address}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] transition-colors">
                    ⌘ {t(lang, "viewExplorer")}
                  </a>
                  <button onClick={wallet.disconnect}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--red)] hover:bg-[var(--red-glow)] w-full text-left transition-colors">
                    ✕ {t(lang, "disconnect")}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={wallet.connect} disabled={wallet.isConnecting || !wallet.hasMetaMask}
                className="btn-hack px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="text-base">🦊</span>
                {wallet.isConnecting ? "..." : t(lang, "connectWallet")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wrong network */}
      {wallet.address && !wallet.isOnFuji && (
        <div className="relative z-10 bg-[var(--red-glow)] border-b border-[rgba(255,51,85,0.3)] px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--red)]">⚠ {t(lang, "wrongNetwork")}</span>
            <button onClick={wallet.connect} className="btn-hack px-3 py-1 rounded text-[10px]">{t(lang, "switchBtn")}</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav className="relative z-10 border-b border-[var(--border-color)] px-2 sm:px-6 bg-[var(--bg-dark)]/80 backdrop-blur-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-0 min-w-max sm:min-w-0">
          {TAB_KEYS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`tab-underline px-3 sm:px-5 py-3 text-[10px] sm:text-xs font-mono font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "tab-active text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}>
              <span className={`mr-1.5 sm:mr-2 transition-all ${activeTab === tab.id ? "opacity-100" : "opacity-40"}`}>{tab.icon}</span>
              <span className="hidden sm:inline">{t(lang, tab.key)}</span>
              <span className="sm:hidden">{t(lang, tab.key).split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 px-3 sm:px-6 py-5 sm:py-8">
        <div className="max-w-7xl mx-auto animate-slideUp">
          {activeTab === "contract" && <ContractAnalyzer onAnalysis={refreshAll} lang={lang} addToHistory={addToHistory} />}
          {activeTab === "transaction" && <TxAnalyzer onAnalysis={refreshAll} lang={lang} addToHistory={addToHistory} />}
          {activeTab === "agent" && <AgentGuard onAnalysis={refreshAll} lang={lang} addToHistory={addToHistory} />}
          {activeTab === "log" && <AuditLog lang={lang} />}
          {activeTab === "api" && <ApiDocs lang={lang} />}
        </div>

        {/* Session History Bar */}
        {sessionHistory.length > 0 && activeTab !== "log" && activeTab !== "api" && (
          <div className="max-w-7xl mx-auto mt-6">
            <div className="p-4 rounded-xl glass-card">
              <h3 className="text-xs font-mono font-bold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {lang === "es" ? "HISTORIAL DE SESIÓN" : "SESSION HISTORY"}
                <span className="text-[var(--accent)]">({sessionHistory.length})</span>
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sessionHistory.map((h, i) => (
                  <div key={i} className="flex-shrink-0 px-3 py-2 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-color)] text-xs font-mono min-w-[160px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        h.decision === "BLOCK" ? "risk-high" : h.riskLevel === "HIGH" ? "risk-high" : h.riskLevel === "MEDIUM" ? "risk-medium" : "risk-low"
                      }`}>
                        {h.decision || h.riskLevel}
                      </span>
                      <span className="text-[var(--text-secondary)] text-[9px]">{h.type}</span>
                    </div>
                    <div className="text-[var(--text-secondary)] text-[9px] truncate">{h.summary}</div>
                    <div className="text-[var(--accent)] text-[8px] mt-1 opacity-50">
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-color)] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
          <span>{t(lang, "footer")}</span>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded border border-[var(--border-color)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-all cursor-default">[x402]</span>
            <span className="px-2 py-0.5 rounded border border-[var(--border-color)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-all cursor-default">[EncryptedERC]</span>
            <span className="px-2 py-0.5 rounded border border-[var(--border-color)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-all cursor-default">[ERC-8004]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
