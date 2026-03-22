import { useState, useEffect, useRef } from "react";
import { t } from "../i18n.js";

export default function AuditLog({ lang = "es" }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentInfo, setAgentInfo] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newEntry, setNewEntry] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, BLOCK, ALLOW
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
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl glass-card border-[var(--accent-border)] shadow-lg shadow-[var(--accent-glow)] animate-pop flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />
          <span className="text-sm font-mono text-[var(--accent)]">{t(lang, "newDecision")}</span>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold gradient-text">{t(lang, "auditTitle")}</h2>
        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
            {["ALL", "BLOCK", "ALLOW"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold transition-all ${
                  filter === f
                    ? f === "BLOCK" ? "bg-[var(--red-glow)] text-[var(--red)] border-r border-[var(--border-color)]"
                    : f === "ALLOW" ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                    : "bg-[var(--bg-card-hover)] text-[var(--text-primary)] border-r border-[var(--border-color)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border-r border-[var(--border-color)] last:border-r-0"
                }`}>
                {f}
              </button>
            ))}
          </div>

          <label className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
            <div className="relative">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="sr-only peer" />
              <div className="w-8 h-4 rounded-full bg-[var(--border-color)] peer-checked:bg-[var(--accent)] transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
            </div>
            {t(lang, "autoRefresh")}
          </label>
          <button onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent-border)] transition-all flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {t(lang, "refresh")}
          </button>
        </div>
      </div>

      {/* Agent Identity Card */}
      {agentInfo && (
        <div className="p-6 rounded-xl glass-card card-glow">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {/* Agent avatar */}
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-border)] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{agentInfo.name}</h3>
                  {agentInfo.active && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 font-mono">
                      <span className="w-1 h-1 rounded-full bg-green-400 pulse-dot" />
                      {t(lang, "active")}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {lang === "es"
                  ? "Agente de seguridad autonomo que analiza smart contracts y transacciones antes de su ejecucion, bloquea acciones riesgosas y construye reputacion on-chain."
                  : agentInfo.description}
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {agentInfo.capabilities?.map((cap, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">{cap}</span>
                ))}
              </div>
            </div>
            {reputation && (
              <div className="grid grid-cols-3 gap-5 text-center">
                <div className="p-3 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent-border)]">
                  <div className="text-2xl font-bold text-[var(--accent)] font-mono">{reputation.score}</div>
                  <div className="text-[9px] text-[var(--text-secondary)] font-mono mt-0.5">{lang === "es" ? "PUNTAJE" : "SCORE"}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--red-glow)] border border-[rgba(255,51,85,0.2)]">
                  <div className="text-2xl font-bold text-[var(--red)] font-mono">{reputation.blockedThreats}</div>
                  <div className="text-[9px] text-[var(--text-secondary)] font-mono mt-0.5">{lang === "es" ? "BLOQUEADOS" : "BLOCKED"}</div>
                </div>
                <div className="p-3 rounded-xl bg-[rgba(0,170,255,0.08)] border border-[rgba(0,170,255,0.2)]">
                  <div className="text-2xl font-bold text-[var(--blue)] font-mono">{reputation.allowedSafe}</div>
                  <div className="text-[9px] text-[var(--text-secondary)] font-mono mt-0.5">{lang === "es" ? "PERMITIDOS" : "ALLOWED"}</div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            {lang === "es" ? "Agente" : "Agent"}: <span className="text-[var(--accent)] opacity-70">{agentInfo.address}</span>
          </div>
        </div>
      )}

      {/* Log entries */}
      {loading ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <svg className="animate-spin h-6 w-6 mx-auto mb-3 text-[var(--accent)]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          {t(lang, "loadingOnChain")}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center mb-3">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <p>{t(lang, "noEntries")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.filter(e => filter === "ALL" || e.decision === filter).map((entry, i) => (
            <div key={i} className={`timeline-entry ${entry.decision === "BLOCK" ? "entry-block" : ""} p-4 rounded-lg card-glow ${
              i === 0 && newEntry ? 'animate-pop' : ''
            } ${i % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-card)]/60'} border border-[var(--border-color)] flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                entry.decision === "BLOCK"
                  ? "bg-red-500/15 border border-[rgba(255,51,85,0.2)]"
                  : "bg-green-500/15 border border-green-500/20"
              }`}>
                {entry.decision === "BLOCK" ? (
                  <svg className="w-5 h-5 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                )}
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
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-mono text-[var(--accent)] opacity-60">{entry.target?.substring(0, 10)}...</div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{new Date(entry.timestamp * 1000).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
