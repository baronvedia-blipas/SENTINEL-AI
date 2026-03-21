import { t } from "../i18n.js";
import { SentinelLogoLarge } from "./SentinelLogo.jsx";

export default function LandingPage({ onEnter, lang = "es" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden scanline">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.04] rounded-full blur-[120px]" />

      <div className="relative z-10 text-center space-y-8 px-6">
        {/* Logo */}
        <SentinelLogoLarge />

        {/* Title */}
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[var(--accent)]"
            style={{ textShadow: "0 0 40px var(--accent-glow)" }}>
            SENTINEL AI
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-[var(--accent-border)]" />
            <p className="text-base text-[var(--text-secondary)] font-mono">
              {t(lang, "landingSubtitle")}
            </p>
            <span className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-[var(--accent-border)]" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
          {["ERC-8004", "x402", "EncryptedERC", "Avalanche"].map((tag) => (
            <span key={tag}
              className="px-3 py-1 rounded font-mono text-xs border border-[var(--accent-border)] text-[var(--accent)] bg-[var(--accent-glow)]">
              [{tag}]
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed font-mono">
          &gt; {t(lang, "landingDesc")}
          <span className="typing-cursor" />
        </p>

        {/* CTA */}
        <button onClick={onEnter}
          className="btn-primary px-10 py-4 rounded-lg text-lg tracking-wider">
          {t(lang, "enterApp")} →
        </button>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />
          {t(lang, "liveOn")}
        </div>
      </div>

      <div className="absolute bottom-6 text-xs font-mono text-[var(--text-secondary)] opacity-50">
        Avalanche — Aleph Hackathon 2026
      </div>
    </div>
  );
}
