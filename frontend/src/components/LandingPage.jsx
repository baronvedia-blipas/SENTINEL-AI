export default function LandingPage({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(rgba(49,130,206,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(49,130,206,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-6">
        {/* Logo */}
        <div className="text-8xl mb-4 animate-pop">🛡️</div>

        {/* Title */}
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Sentinel AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mt-4 max-w-2xl mx-auto">
            Autonomous Security Agent for Web3
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
          {[
            { label: "ERC-8004 Agent", color: "blue" },
            { label: "x402 Micropayments", color: "purple" },
            { label: "EncryptedERC", color: "green" },
            { label: "Avalanche Fuji", color: "red" },
          ].map((tag) => (
            <span
              key={tag.label}
              className={`px-3 py-1.5 rounded-lg text-sm border bg-${tag.color}-500/10 border-${tag.color}-500/20 text-${tag.color}-300`}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
          Analyzes smart contracts and transactions <strong className="text-[var(--text-primary)]">before execution</strong>.
          Blocks risky actions. Builds on-chain reputation from every correct decision.
        </p>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold text-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
        >
          Enter App
        </button>

        {/* Network badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-red-400 pulse-dot" />
          Live on Avalanche Fuji Testnet
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-xs text-[var(--text-secondary)]">
        Avalanche — Aleph Hackathon 2026
      </div>
    </div>
  );
}
