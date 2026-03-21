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

const API = "/api";
const AGENT_ADDRESS = "0x567FCdC8e7148a60b91F3367D09EB1b23aF413aC";

const TAB_KEYS = [
  { id: "demo", key: "liveDemo", icon: "🎬" },
  { id: "contract", key: "contractAnalyzer", icon: "📝" },
  { id: "transaction", key: "txAnalyzer", icon: "💸" },
  { id: "agent", key: "agentGuard", icon: "🤖" },
  { id: "profile", key: "agentIdentity", icon: "🆔" },
  { id: "log", key: "auditLog", icon: "📋" },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState("demo");
  const [agentInfo, setAgentInfo] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [health, setHealth] = useState(null);
  const [lang, setLang] = useState("es");

  const wallet = useWallet();
  const isOwner = wallet.address?.toLowerCase() === AGENT_ADDRESS.toLowerCase();

  const refreshAll = () => {
    fetch(`${API}/agent/identity`).then(r => r.json()).then(setAgentInfo).catch(() => {});
    fetch(`${API}/agent/reputation`).then(r => r.json()).then(setReputation).catch(() => {});
    fetch(`${API}/health`).then(r => r.json()).then(setHealth).catch(() => {});
  };

  useEffect(() => { refreshAll(); }, []);

  // Show landing page
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} lang={lang} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowLanding(true)}>
            <div className="text-3xl">🛡️</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Sentinel AI</h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {t(lang, "subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* ERC-8004 Badge */}
            {agentInfo?.active && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 pulse-dot" />
                <span className="text-blue-300">ERC-8004</span>
              </div>
            )}

            {/* Stats Dashboard */}
            {reputation && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm">
                <div className="text-center px-1">
                  <div className="text-base font-bold text-green-400">{reputation.score}</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">SCORE</div>
                </div>
                <div className="w-px h-7 bg-[var(--border-color)]" />
                <div className="text-center px-1">
                  <div className="text-base font-bold text-red-400">{reputation.blockedThreats}</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">BLOCKED</div>
                </div>
                <div className="w-px h-7 bg-[var(--border-color)]" />
                <div className="text-center px-1">
                  <div className="text-base font-bold text-blue-400">{reputation.allowedSafe}</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">ALLOWED</div>
                </div>
                <div className="w-px h-7 bg-[var(--border-color)]" />
                <div className="text-center px-1">
                  <div className="text-base font-bold">{reputation.totalDecisions}</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">TOTAL</div>
                </div>
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--bg-card-hover)] transition-colors"
              title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
            >
              {lang === "es" ? "ES" : "EN"}
            </button>

            {/* Balance */}
            {health && (
              <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm">
                <div className="text-base font-bold text-yellow-400">{parseFloat(health.balance).toFixed(3)}</div>
                <div className="text-[9px] text-[var(--text-secondary)]">AVAX</div>
              </div>
            )}

            {/* Network */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
              <span className="text-red-300">Fuji</span>
            </div>

            {/* Wallet */}
            {wallet.address ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm bg-[var(--bg-card)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)]">
                  <span className="text-lg">🦊</span>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{wallet.shortAddress}</span>
                      {isOwner && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">OWNER</span>
                      )}
                    </div>
                    <div className="text-[9px] text-[var(--text-secondary)]">{wallet.isOnFuji ? "Fuji C-Chain" : "Wrong Network"}</div>
                  </div>
                  <span className="text-[var(--text-secondary)] text-xs ml-1">▼</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-3 py-2 border-b border-[var(--border-color)]">
                    <div className="text-xs font-mono text-[var(--text-secondary)]">{wallet.address}</div>
                  </div>
                  <a href={`https://testnet.snowtrace.io/address/${wallet.address}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]">
                    <span>🔍</span> {t(lang, "viewExplorer")}
                  </a>
                  <button onClick={wallet.disconnect}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full text-left">
                    <span>🚪</span> {t(lang, "disconnect")}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={wallet.connect} disabled={wallet.isConnecting || !wallet.hasMetaMask}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 text-sm font-medium text-white shadow-lg shadow-orange-500/20">
                <span className="text-lg">🦊</span>
                {wallet.isConnecting ? t(lang, "connecting") : !wallet.hasMetaMask ? t(lang, "installMetamask") : t(lang, "connectWallet")}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Wrong network */}
      {wallet.address && !wallet.isOnFuji && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-sm text-yellow-300">{t(lang, "wrongNetwork")}</span>
            <button onClick={wallet.connect} className="text-xs px-3 py-1 rounded bg-yellow-500/20 text-yellow-300">{t(lang, "switchBtn")}</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <nav className="border-b border-[var(--border-color)] px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {TAB_KEYS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}>
              <span className="mr-2">{tab.icon}</span>
              {t(lang, tab.key)}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "demo" && <DemoRunner onComplete={refreshAll} lang={lang} />}
          {activeTab === "contract" && <ContractAnalyzer onAnalysis={refreshAll} lang={lang} />}
          {activeTab === "transaction" && <TxAnalyzer onAnalysis={refreshAll} lang={lang} />}
          {activeTab === "agent" && <AgentGuard onAnalysis={refreshAll} />}
          {activeTab === "profile" && <AgentProfile />}
          {activeTab === "log" && <AuditLog />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{t(lang, "footer")}</span>
          <div className="flex items-center gap-4">
            <span>x402 Micropayments</span>
            <span>EncryptedERC Reports</span>
            <span>ERC-8004 Identity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
