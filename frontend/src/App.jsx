import { useState, useEffect } from "react";
import ContractAnalyzer from "./components/ContractAnalyzer.jsx";
import TxAnalyzer from "./components/TxAnalyzer.jsx";
import AgentGuard from "./components/AgentGuard.jsx";
import AuditLog from "./components/AuditLog.jsx";
import DemoRunner from "./components/DemoRunner.jsx";
import AgentProfile from "./components/AgentProfile.jsx";
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
  { id: "profile", key: "agentIdentity", icon: "●" },
  { id: "log", key: "auditLog", icon: "≡" },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState("contract");
  const [agentInfo, setAgentInfo] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [health, setHealth] = useState(null);
  const [lang, setLang] = useState("es");
  const [langCooldown, setLangCooldown] = useState(false);

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] px-6 py-3 bg-[var(--bg-card)]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowLanding(true)}>
            <SentinelLogo size={28} glow={true} />
            <div>
              <h1 className="text-base font-bold text-[var(--accent)] tracking-wider group-hover:text-white transition-colors">
                SENTINEL AI
              </h1>
              <p className="text-[10px] font-mono text-[var(--text-secondary)]">
                {t(lang, "subtitle")}
              </p>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="hidden md:flex items-center gap-1 font-mono text-xs">
            {reputation && (
              <>
                <div className="px-2.5 py-1 rounded bg-[var(--accent-glow)] border border-[var(--accent-border)]">
                  <span className="text-[var(--text-secondary)]">REP </span>
                  <span className="text-[var(--accent)] font-bold">{reputation.score}</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-[var(--red-glow)] border border-[rgba(255,51,85,0.25)]">
                  <span className="text-[var(--text-secondary)]">BLK </span>
                  <span className="text-[var(--red)] font-bold">{reputation.blockedThreats}</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-[var(--accent-glow)] border border-[var(--accent-border)]">
                  <span className="text-[var(--text-secondary)]">ALW </span>
                  <span className="text-[var(--accent)] font-bold">{reputation.allowedSafe}</span>
                </div>
                {health && (
                  <div className="px-2.5 py-1 rounded bg-[rgba(255,204,0,0.08)] border border-[rgba(255,204,0,0.2)]">
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
              {agentInfo?.active && (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border border-[var(--accent-border)] text-[var(--accent)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
                  ERC-8004
                </span>
              )}
              <span className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono border border-[var(--red-glow)] text-[var(--red)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] pulse-dot" />
                FUJI
              </span>
            </div>

            {/* Lang */}
            <button onClick={toggleLang} disabled={langCooldown}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all ${
                langCooldown ? "opacity-40 cursor-not-allowed" : "hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
              } border-[var(--border-color)] text-[var(--text-secondary)]`}>
              {lang === "es" ? "ES" : "EN"}
            </button>

            {/* Wallet */}
            {wallet.address ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-mono border-[var(--accent-border)] bg-[var(--accent-glow)] text-[var(--accent)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  {wallet.shortAddress}
                  {isOwner && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-[var(--accent)] text-[var(--bg-dark)]">
                      OWNER
                    </span>
                  )}
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-3 py-2 border-b border-[var(--border-color)]">
                    <div className="text-[10px] font-mono text-[var(--text-secondary)] break-all">{wallet.address}</div>
                  </div>
                  <a href={`https://testnet.snowtrace.io/address/${wallet.address}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]">
                    ⌘ {t(lang, "viewExplorer")}
                  </a>
                  <button onClick={wallet.disconnect}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--red)] hover:bg-[var(--red-glow)] w-full text-left">
                    ✕ {t(lang, "disconnect")}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={wallet.connect} disabled={wallet.isConnecting || !wallet.hasMetaMask}
                className="btn-hack px-3 py-1.5 rounded text-xs font-mono font-bold">
                {wallet.isConnecting ? "..." : t(lang, "connectWallet")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wrong network */}
      {wallet.address && !wallet.isOnFuji && (
        <div className="bg-[var(--red-glow)] border-b border-[rgba(255,51,85,0.3)] px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--red)]">⚠ {t(lang, "wrongNetwork")}</span>
            <button onClick={wallet.connect} className="btn-hack px-3 py-1 rounded text-[10px]">{t(lang, "switchBtn")}</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav className="border-b border-[var(--border-color)] px-6 bg-[var(--bg-dark)]">
        <div className="max-w-7xl mx-auto flex gap-0">
          {TAB_KEYS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-mono font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]"
              }`}>
              <span className="mr-1.5 opacity-50">{tab.icon}</span>
              {t(lang, tab.key)}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "contract" && <ContractAnalyzer onAnalysis={refreshAll} lang={lang} />}
          {activeTab === "transaction" && <TxAnalyzer onAnalysis={refreshAll} lang={lang} />}
          {activeTab === "agent" && <AgentGuard onAnalysis={refreshAll} lang={lang} />}
          {activeTab === "profile" && <AgentProfile />}
          {activeTab === "log" && <AuditLog />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)]">
          <span>{t(lang, "footer")}</span>
          <div className="flex items-center gap-3">
            <span>[x402]</span>
            <span>[EncryptedERC]</span>
            <span>[ERC-8004]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
