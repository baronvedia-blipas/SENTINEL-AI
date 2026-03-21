export default function SentinelLogo({ size = 40, glow = true }) {
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: glow ? "drop-shadow(0 0 12px rgba(0,255,136,0.4))" : "none",
      }}
    >
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size * 1.2}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield outline */}
        <path
          d="M50 5 L90 25 L90 65 Q90 95 50 115 Q10 95 10 65 L10 25 Z"
          stroke="var(--accent)"
          strokeWidth="3"
          fill="rgba(0,255,136,0.06)"
        />

        {/* Inner shield border */}
        <path
          d="M50 15 L80 32 L80 62 Q80 88 50 105 Q20 88 20 62 L20 32 Z"
          stroke="var(--accent)"
          strokeWidth="1"
          strokeOpacity="0.3"
          fill="none"
        />

        {/* Circuit lines - left */}
        <line x1="20" y1="45" x2="38" y2="45" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="38" y1="45" x2="38" y2="60" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="38" cy="60" r="2" fill="var(--accent)" fillOpacity="0.6" />

        {/* Circuit lines - right */}
        <line x1="80" y1="45" x2="62" y2="45" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="62" y1="45" x2="62" y2="60" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="62" cy="60" r="2" fill="var(--accent)" fillOpacity="0.6" />

        {/* Circuit lines - top */}
        <line x1="50" y1="15" x2="50" y2="35" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="50" cy="35" r="2" fill="var(--accent)" fillOpacity="0.6" />

        {/* Circuit lines - bottom */}
        <line x1="50" y1="75" x2="50" y2="95" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="50" cy="75" r="2" fill="var(--accent)" fillOpacity="0.6" />

        {/* Center eye / vigía */}
        <circle cx="50" cy="55" r="14" stroke="var(--accent)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="55" r="8" stroke="var(--accent)" strokeWidth="1.5" fill="rgba(0,255,136,0.1)" />
        <circle cx="50" cy="55" r="3" fill="var(--accent)">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Cross-hair lines through eye */}
        <line x1="36" y1="55" x2="44" y2="55" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="56" y1="55" x2="64" y2="55" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="50" y1="41" x2="50" y2="47" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="50" y1="63" x2="50" y2="69" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />

        {/* Corner brackets - terminal style */}
        <path d="M15 20 L15 12 L23 12" stroke="var(--accent)" strokeWidth="2" fill="none" strokeOpacity="0.6" />
        <path d="M85 20 L85 12 L77 12" stroke="var(--accent)" strokeWidth="2" fill="none" strokeOpacity="0.6" />
        <path d="M22 108 L14 108 L14 100" stroke="var(--accent)" strokeWidth="2" fill="none" strokeOpacity="0.6" />
        <path d="M78 108 L86 108 L86 100" stroke="var(--accent)" strokeWidth="2" fill="none" strokeOpacity="0.6" />
      </svg>
    </div>
  );
}

export function SentinelLogoLarge() {
  return (
    <div className="relative inline-flex items-center justify-center animate-pop">
      <SentinelLogo size={100} glow={true} />
      {/* Orbital ring */}
      <div
        className="absolute rounded-full border border-[var(--accent)] opacity-20"
        style={{
          width: 140,
          height: 140,
          animation: "spin 12s linear infinite",
        }}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
