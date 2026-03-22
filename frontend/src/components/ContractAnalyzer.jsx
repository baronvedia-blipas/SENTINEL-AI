import { useState } from "react";
import { t } from "../i18n.js";
import X402Tooltip from "./X402Tooltip.jsx";

const EXAMPLES = [
  {
    nameEs: "Reentrancy",
    nameEn: "Reentrancy",
    risk: "HIGH",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VulnerableVault {
    mapping(address => uint256) public deposits;

    function deposit() public payable {
        deposits[msg.sender] += msg.value;
    }

    function withdrawAll() public {
        uint256 amount = deposits[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        deposits[msg.sender] = 0;
    }
}`,
  },
  {
    nameEs: "Approval + tx.origin",
    nameEn: "Approval + tx.origin",
    risk: "HIGH",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UnsafeToken {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowance;

    function approve(address spender) public {
        allowance[msg.sender][spender] = type(uint256).max;
    }

    function transferFrom(address from, address to, uint256 amount) public {
        require(tx.origin == from, "Not authorized");
        balances[from] -= amount;
        balances[to] += amount;
    }
}`,
  },
  {
    nameEs: "Send sin verificar",
    nameEn: "Unchecked send",
    risk: "MEDIUM",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WeakWallet {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function sendReward(address to, uint256 amount) public {
        payable(to).send(amount);
        balances[to] += amount;
    }

    function setBalance(address user, uint256 amount) public {
        balances[user] = amount;
    }
}`,
  },
  {
    nameEs: "5 vulnerabilidades",
    nameEn: "5 vulnerabilities",
    risk: "HIGH",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NightmareContract {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    address public owner;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount;
    }

    function approveMax(address spender) public {
        allowances[msg.sender][spender] = type(uint256).max;
    }

    function checkOwner() public view returns (bool) {
        return tx.origin == owner;
    }

    function sendPrize(address winner, uint256 amount) public {
        payable(winner).send(amount);
    }

    function updateBalance(address user, uint256 val) public {
        balances[user] = val;
    }
}`,
  },
  {
    nameEs: "Contrato Seguro",
    nameEn: "Safe Contract",
    risk: "LOW",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeVault {
    mapping(address => uint256) public balances;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "Must send value");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        require(amount <= balances[msg.sender], "Insufficient");
        balances[msg.sender] -= amount;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}`,
  },
];

export default function ContractAnalyzer({ onAnalysis, lang = "es" }) {
  const [sourceCode, setSourceCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze/contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-402-Payment": "demo-payment-token",
        },
        body: JSON.stringify({ sourceCode, lang }),
      });
      const data = await res.json();
      setResult(data);
      onAnalysis?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t(lang, "contractTitle")}</h2>
          <button
            className="text-xs px-3 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors relative group"
          >
            {t(lang, "loadExample")} ▾
            <div className="absolute right-0 top-full mt-1 w-52 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setSourceCode(ex.code)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-left hover:bg-[var(--bg-card-hover)] transition-colors">
                  <span>{lang === "es" ? ex.nameEs : ex.nameEn}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold risk-${ex.risk.toLowerCase()}`}>{ex.risk}</span>
                </button>
              ))}
            </div>
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          {t(lang, "contractDesc")}
        </p>

        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          placeholder={t(lang, "pasteCode")}
          className="w-full h-80 p-4 code-block resize-none focus:outline-none focus:border-blue-500/50 text-sm text-green-300"
          spellCheck={false}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            {t(lang, "cost")}: $0.001 USDC {t(lang, "via")} x402
          </span>
          <button
            onClick={analyze}
            disabled={loading || !sourceCode.trim()}
            className="btn-primary px-6 py-2.5 rounded-lg font-mono text-sm tracking-wider"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {t(lang, "analyzing")}
              </span>
            ) : t(lang, "analyzeBtn")}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-4">
        {/* Scanning animation */}
        {loading && (
          <div className="p-4 rounded-lg bg-[#080c10] border border-[var(--accent-border)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80"
              style={{ animation: "scanDown 1.5s ease-in-out infinite" }} />
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[var(--accent)]">[SENTINEL] {lang === "es" ? "Iniciando análisis..." : "Starting analysis..."}</div>
              <div className="text-[var(--text-secondary)]" style={{ animation: "fadeIn 0.5s 0.3s both" }}>[SCAN] {lang === "es" ? "Buscando patrones de reentrancy..." : "Scanning for reentrancy patterns..."}</div>
              <div className="text-[var(--text-secondary)]" style={{ animation: "fadeIn 0.5s 0.8s both" }}>[SCAN] {lang === "es" ? "Verificando approvals..." : "Checking approvals..."}</div>
              <div className="text-[var(--text-secondary)]" style={{ animation: "fadeIn 0.5s 1.3s both" }}>[SCAN] {lang === "es" ? "Analizando autenticación..." : "Analyzing authentication..."}</div>
              <div className="text-[var(--yellow)]" style={{ animation: "fadeIn 0.5s 1.8s both" }}>[AI] {lang === "es" ? "Generando explicación..." : "Generating explanation..."}</div>
              <div className="text-[var(--accent)]" style={{ animation: "fadeIn 0.5s 2.3s both" }}>[x402] {lang === "es" ? "Verificando pago..." : "Verifying payment..."}</div>
            </div>
            <style>{`
              @keyframes scanDown { 0%,100% { transform: translateY(0); } 50% { transform: translateY(100px); } }
              @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {t(lang, "error")}: {error}
          </div>
        )}

        {result?.riskLevel === "INVALID" && (
          <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">{t(lang, "notSolidity")}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {t(lang, "notSolidityDesc")}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              {t(lang, "notSolidityHint")} <code className="text-yellow-300">pragma solidity</code> {t(lang, "notSolidityHint2")} <code className="text-yellow-300">contract</code>, <code className="text-yellow-300">function</code>, {t(lang, "notSolidityEtc")}
            </p>
          </div>
        )}

        {result && result.riskLevel !== "INVALID" && (
          <>
            {/* Risk Badge */}
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold text-lg risk-${result.riskLevel.toLowerCase()}`}>
                {result.riskLevel}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{result.summary}</span>
            </div>

            {/* Findings */}
            {result.findings?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">{t(lang, "findings")}</h3>
                {result.findings.map((f, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] card-glow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()}`}>
                        {f.severity}
                      </span>
                      <span className="font-medium text-sm">{f.name}</span>
                      <span className="text-xs text-[var(--text-secondary)] ml-auto">{t(lang, "line")} {f.line}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{f.detail}</p>
                    <code className="text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded block overflow-x-auto">
                      {f.code}
                    </code>
                  </div>
                ))}
              </div>
            )}

            {/* AI Explanation */}
            {result.aiExplanation && (
              <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <span>🤖</span> {t(lang, "aiAnalysis")}
                  {result.aiExplanation._provider && result.aiExplanation._provider !== "fallback" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400 border border-green-500/20">
                      {result.aiExplanation._provider}
                    </span>
                  ) : result.aiExplanation._provider === "fallback" ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                      {t(lang, "ruleBased")}
                    </span>
                  ) : null}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-3">
                  {result.aiExplanation.explanation}
                </p>

                {result.aiExplanation.fixes?.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <h4 className="text-xs font-semibold text-blue-300">{t(lang, "suggestedFixes")}:</h4>
                    {result.aiExplanation.fixes.map((fix, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-green-400 font-medium">{fix.vulnerability}:</span>{" "}
                        <span className="text-[var(--text-secondary)]">{fix.fix}</span>
                        {fix.code_example && (
                          <pre className="mt-2 p-3 code-block text-xs text-green-300 overflow-x-auto">
                            {fix.code_example}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.aiExplanation.overall_recommendation && (
                  <p className="text-sm text-blue-300 bg-blue-500/10 p-2 rounded">
                    {result.aiExplanation.overall_recommendation}
                  </p>
                )}
              </div>
            )}

            {/* On-chain proof */}
            {result.onChain && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h3 className="font-semibold text-sm mb-2 text-green-300">{t(lang, "onChainRecord")}</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-[var(--text-secondary)]">{t(lang, "txHash")}: </span>
                    <a
                      href={result.onChain.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-mono text-xs"
                    >
                      {result.onChain.txHash}
                    </a>
                  </p>
                  <p>
                    <span className="text-[var(--text-secondary)]">{t(lang, "entryId")}: </span>
                    <span className="font-mono">{result.onChain.entryId}</span>
                  </p>
                </div>
              </div>
            )}

            {/* EncryptedERC */}
            {result.encryption && (
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-semibold text-sm mb-2 text-purple-300 flex items-center gap-2">
                  🔐 EncryptedERC
                </h3>
                <div className="space-y-1 text-xs font-mono text-[var(--text-secondary)]">
                  <p>{lang === "es" ? "Algoritmo" : "Algorithm"}: <span className="text-purple-300">{result.encryption.algorithm}</span></p>
                  <p>{lang === "es" ? "Derivación de clave" : "Key derivation"}: <span className="text-purple-300">{result.encryption.keyDerivation}</span></p>
                  <p>{lang === "es" ? "Estado" : "Status"}: <span className="text-[var(--accent)]">{lang === "es" ? "Encriptado en blockchain" : "Encrypted on blockchain"}</span></p>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-2">
                  {lang === "es"
                    ? "El reporte completo está encriptado on-chain. Solo el dueño del agente puede desencriptarlo."
                    : "The full report is encrypted on-chain. Only the agent owner can decrypt it."}
                </p>
              </div>
            )}

            {/* Payment info */}
            {result.payment && (
              <X402Tooltip cost={result.payment.cost} lang={lang} />
            )}
          </>
        )}

        {!result && !error && (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm">
            <div className="text-center">
              <div className="text-4xl mb-3">📝</div>
              <p>{t(lang, "emptyContract")} "{t(lang, "analyzeBtn")}"</p>
              <p className="text-xs mt-1">{t(lang, "emptyContractHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
