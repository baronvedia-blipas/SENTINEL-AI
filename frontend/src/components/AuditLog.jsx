import { useState, useEffect, useRef } from "react";
import { t } from "../i18n.js";

export default function AuditLog({ lang = "es" }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newEntry, setNewEntry] = useState(false);
  const prevCount = useRef(0);

  const refresh = async () => {
    try {
      const [logRes, identityRes, repRes] = await Promise.all([
        fetch("/api/audit-log?count=20").then(r => r.json()),
        fetch("/api/agent/identity").then(r => r.json()),
        fetch("/api/agent/reputation").then(r => r.json()),
      ]);
      const newEntries = logRes.entries || [];
      if (newEntries.length > prevCount.current && prevCount.current > 0) {
        setNewEntry(true);
        setTimeout(() => setNewEntry(false), 2000);
      }
      prevCount.current = newEntries.length;
      setEntries(newEntries);
      setAgentInfo(identityRes);
      setReputation(repRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* New entry notification */}
      {newEntry && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pop flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white pulse-dot" />
          {t(lang, "newDecision")}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t(lang, "auditTitle")}</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            {t(lang, "autoRefresh")}
          </label>
          <button onClick={refresh}
            className="text-xs px-3 py-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors">
            {t(lang, "refresh")}
          </button>
        </div>
      </div>

      {/* Agent Identity Card */}
      {agentInfo && (
        <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] card-glow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{agentInfo.name}</h3>
                {agentInfo.active && (
                  <span className="px-2 py-0.5 rounded text-xs bg-green-500/15 text-green-400 border border-green-500/20">{t(lang, "active")}</span>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] max-w-xl">{agentInfo.description}</p>
              <div className="flex gap-2 mt-3">
                {agentInfo.capabilities?.map((cap, i) => (
                  <span key={i} className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">{cap}</span>
                ))}
              </div>
            </div>
            {reputation && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{reputation.score}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">SCORE</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{reputation.blockedThreats}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">BLOCKED</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{reputation.allowedSafe}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">ALLOWED</div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)]">
            Agent: {agentInfo.address}
          </div>
        </div>
      )}

      {/* Log entries */}
      {loading ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">{t(lang, "loadingOnChain")}</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          <div className="text-4xl mb-3">📋</div>
          <p>{t(lang, "noEntries")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div key={i} className={`p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center gap-4 card-glow ${i === 0 && newEntry ? 'animate-pop' : ''}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                entry.decision === "BLOCK" ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
              }`}>
                {entry.decision === "BLOCK" ? "🚫" : "✅"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${entry.decision === "BLOCK" ? "risk-high" : "risk-low"}`}>
                    {entry.decision}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs risk-${entry.riskLevel.toLowerCase()}`}>
                    {entry.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">{entry.reason}</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-[var(--text-secondary)]">{entry.target?.substring(0, 10)}...</div>
                <div className="text-xs text-[var(--text-secondary)]">{new Date(entry.timestamp * 1000).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
