import { useState, useEffect } from "react";
import SentinelLogo from "./SentinelLogo.jsx";

export default function AgentProfile() {
  const [agent, setAgent] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent/identity").then(r => r.json()),
      fetch("/api/agent/reputation").then(r => r.json()),
      fetch("/api/audit-log?count=20").then(r => r.json()),
    ]).then(([a, r, l]) => {
      setAgent(a);
      setReputation(r);
      setEntries(l.entries || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-[var(--text-secondary)]">Loading agent profile...</div>;

  const blockedCount = entries.filter(e => e.decision === "BLOCK").length;
  const allowedCount = entries.filter(e => e.decision === "ALLOW").length;
  const accuracy = entries.length > 0 ? Math.round((blockedCount / entries.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-card)] to-blue-500/5 border border-[var(--border-color)] card-glow">
        <div className="flex items-start gap-6">
          <SentinelLogo size={60} glow={true} />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{agent?.name || "Sentinel AI"}</h2>
              {agent?.active && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/20">
                  ACTIVE
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                ERC-8004
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl">{agent?.description}</p>

            {/* Capabilities */}
            <div className="flex gap-2 mt-3">
              {agent?.capabilities?.map((cap, i) => (
                <span key={i} className="px-2.5 py-1 rounded text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {cap}
                </span>
              ))}
            </div>

            {/* Address */}
            <div className="mt-3 text-xs font-mono text-[var(--text-secondary)]">
              <a
                href={`https://testnet.snowtrace.io/address/${agent?.address}`}
                target="_blank" rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                {agent?.address}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Reputation Score", value: reputation?.score || 0, color: "text-green-400", icon: "⭐" },
          { label: "Total Decisions", value: reputation?.totalDecisions || 0, color: "text-white", icon: "📊" },
          { label: "Threats Blocked", value: reputation?.blockedThreats || 0, color: "text-red-400", icon: "🚫" },
          { label: "Safe Actions", value: reputation?.allowedSafe || 0, color: "text-blue-400", icon: "✅" },
          { label: "Detection Rate", value: `${accuracy}%`, color: "text-yellow-400", icon: "🎯" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center card-glow">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Contract Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="https://testnet.snowtrace.io/address/0x24aB78183Cc27649bC8afD07D8b949b2F914eF59#code"
          target="_blank" rel="noopener noreferrer"
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors card-glow">
          <h3 className="font-semibold text-sm mb-1">SentinelGuard Contract</h3>
          <p className="text-xs text-[var(--text-secondary)]">Audit log, decisions, encrypted reports</p>
          <span className="text-xs text-blue-400 font-mono mt-2 block">0x24aB78...eF59</span>
        </a>
        <a href="https://testnet.snowtrace.io/address/0xf9AbfD966521BE7F0950823A635305BcEd56b68A#code"
          target="_blank" rel="noopener noreferrer"
          className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors card-glow">
          <h3 className="font-semibold text-sm mb-1">SentinelERC8004 Registry</h3>
          <p className="text-xs text-[var(--text-secondary)]">Agent identity, capabilities, reputation</p>
          <span className="text-xs text-blue-400 font-mono mt-2 block">0xf9AbfD...b68A</span>
        </a>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
              <span className={entry.decision === "BLOCK" ? "text-red-400" : "text-green-400"}>
                {entry.decision === "BLOCK" ? "🚫" : "✅"}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                entry.decision === "BLOCK" ? "risk-high" : "risk-low"
              }`}>{entry.decision}</span>
              <span className="text-xs text-[var(--text-secondary)] flex-1 truncate">{entry.reason}</span>
              <span className="text-[10px] text-[var(--text-secondary)]">
                {new Date(entry.timestamp * 1000).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
