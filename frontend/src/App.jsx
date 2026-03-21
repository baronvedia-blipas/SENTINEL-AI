import { useState, useEffect } from "react";
import ContractAnalyzer from "./components/ContractAnalyzer.jsx";
import TxAnalyzer from "./components/TxAnalyzer.jsx";
import AgentGuard from "./components/AgentGuard.jsx";
import AuditLog from "./components/AuditLog.jsx";

const API = "/api";

const TABS = [
  { id: "contract", label: "Contract Analyzer", icon: "📝" },
  { id: "transaction", label: "TX Risk Analyzer", icon: "💸" },
  { id: "agent", label: "Agent Guard", icon: "🤖" },
  { id: "log", label: "Audit Log", icon: "📋" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("contract");
  const [agentInfo, setAgentInfo] = useState(null);
  const [reputation, setReputation] = useState(null);

  useEffect(() => {
    fetch(`${API}/agent/identity`).then(r => r.json()).then(setAgentInfo).catch(() => {});
    fetch(`${API}/agent/reputation`).then(r => r.json()).then(setReputation).catch(() => {});
  }, []);

  const refreshReputation = () => {
    fetch(`${API}/agent/reputation`).then(r => r.json()).then(setReputation).catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🛡️</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Sentinel AI</h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Autonomous Security Agent on Avalanche
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ERC-8004 Badge */}
            {agentInfo?.active && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 pulse-dot" />
                <span className="text-blue-300">ERC-8004 Agent</span>
              </div>
            )}

            {/* Reputation */}
            {reputation && (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{reputation.score}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">REP</div>
                </div>
                <div className="w-px h-8 bg-[var(--border-color)]" />
                <div className="text-center">
                  <div className="text-lg font-bold">{reputation.totalDecisions}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">DECISIONS</div>
                </div>
              </div>
            )}

            {/* Network indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
              <span className="text-red-300">Fuji Testnet</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[var(--border-color)] px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-400 text-blue-300"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "contract" && <ContractAnalyzer onAnalysis={refreshReputation} />}
          {activeTab === "transaction" && <TxAnalyzer onAnalysis={refreshReputation} />}
          {activeTab === "agent" && <AgentGuard onAnalysis={refreshReputation} />}
          {activeTab === "log" && <AuditLog />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Sentinel AI — Avalanche Hackathon 2026</span>
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
