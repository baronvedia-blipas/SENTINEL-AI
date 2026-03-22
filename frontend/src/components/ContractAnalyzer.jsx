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

// Simple line number gutter for IDE feel
function LineNumbers({ code }) {
  const lines = (code || "").split("\n").length;
  return (
    <div className="select-none text-right pr-3 pt-4 pb-4 text-[var(--text-secondary)] opacity-30 font-mono text-xs leading-[1.7] border-r border-[var(--border-color)] min-w-[40px]"
      style={{ counterReset: "line" }}>
      {Array.from({ length: Math.max(lines, 15) }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

export default function ContractAnalyzer({ onAnalysis, lang = "es", addToHistory }) {
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
      if (data.riskLevel && data.riskLevel !== "INVALID") {
        addToHistory?.({ type: "contract", riskLevel: data.riskLevel, summary: data.summary, decision: data.riskLevel === "HIGH" ? "BLOCK" : "ALLOW" });
      }
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
          <div>
            <h2 className="text-lg font-bold gradient-text">{t(lang, "contractTitle")}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {t(lang, "contractDesc")}
            </p>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:border-[var(--accent-border)] transition-all relative group"
          >
            {t(lang, "loadExample")} ▾
            <div className="absolute right-0 top-full mt-1 w-56 py-1 rounded-lg glass-card shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setSourceCode(ex.code)}
                  className="flex items-center justify-between w-full px-3 py-2.5 text-xs text-left hover:bg-[var(--accent-glow)] transition-all">
                  <span className="text-[var(--text-primary)]">{lang === "es" ? ex.nameEs : ex.nameEn}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold risk-${ex.risk.toLowerCase()}`}>{ex.risk}</span>
                </button>
              ))}
            </div>
          </button>
        </div>

        {/* IDE-style editor */}
        <div className="rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[var(--accent-border)] transition-all">
          {/* Title bar */}
          <div className="ide-titlebar">
            <div className="ide-dot bg-[var(--red)]" />
            <div className="ide-dot bg-[var(--yellow)]" />
            <div className="ide-dot bg-[var(--accent)]" />
            <span className="text-[10px] font-mono text-[var(--text-secondary)] ml-2">contract.sol</span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] ml-auto opacity-50">Solidity</span>
          </div>
          {/* Editor area */}
          <div className="flex bg-[#060a0e]">
            <LineNumbers code={sourceCode} />
            <textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder={t(lang, "pasteCode")}
              className="ide-textarea flex-1 p-4 h-80 w-full"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)] font-mono">
            {t(lang, "cost")}: <span className="text-[var(--accent)]">$0.001 USDC</span> {t(lang, "via")} x402
          </span>
          <button
            onClick={analyze}
            disabled={loading || !sourceCode.trim()}
            className="btn-primary px-8 py-2.5 rounded-lg font-mono text-sm tracking-wider"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                {t(lang, "analyzing")}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {t(lang, "analyzeBtn")}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Right: Results */}
      <div className="space-y-4">
        {/* Scanning animation */}
        {loading && (
          <div className="p-5 rounded-xl glass-card border-[var(--accent-border)] relative overflow-hidden shield-scan">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80"
              style={{ animation: "scanDown 1.5s ease-in-out infinite" }} />
            <div className="space-y-2.5 font-mono text-xs">
              <div className="text-[var(--accent)] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
                [SENTINEL] {lang === "es" ? "Iniciando analisis..." : "Starting analysis..."}
              </div>
              <div className="text-[var(--text-secondary)]" style={{ animation: "fadeIn 0.5s 0.3s both" }}>
                <span className="text-[var(--red)] mr-1">&#9656;</span>
                [SCAN] {lang === "es" ? "Buscando patrones de reentrancy..." : "Scanning for reentrancy patterns..."}
              </div>
              <div className="text-[var(--text-secondary)]" style={{ animation: "fadeIn 0.5s 0.8s both" }}>
                <span className="text-[var(--yellow)] mr-1">&#9656;</span>
                [SCAN] {lang === "es" ? "Verificando approvals..." : "Checking approvals..."}
              </div>
              <div className="text-[var(--text-secondary)]" style={{ animation: "fadeIn 0.5s 1.3s both" }}>
                <span className="text-[var(--blue)] mr-1">&#9656;</span>
                [SCAN] {lang === "es" ? "Analizando autenticacion..." : "Analyzing authentication..."}
              </div>
              <div className="text-[var(--yellow)]" style={{ animation: "fadeIn 0.5s 1.8s both" }}>
                <span className="mr-1">&#9656;</span>
                [AI] {lang === "es" ? "Generando explicacion..." : "Generating explanation..."}
              </div>
              <div className="text-[var(--accent)]" style={{ animation: "fadeIn 0.5s 2.3s both" }}>
                <span className="mr-1">&#9656;</span>
                [x402] {lang === "es" ? "Verificando pago..." : "Verifying payment..."}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm animate-slideUp">
            {t(lang, "error")}: {error}
          </div>
        )}

        {result?.riskLevel === "INVALID" && (
          <div className="p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center animate-slideUp">
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
          <div className="space-y-4 animate-slideUp">
            {/* Risk Badge */}
            <div className="flex items-center gap-3">
              <span className={`px-5 py-2.5 rounded-lg font-bold text-lg tracking-wider risk-${result.riskLevel.toLowerCase()} ${
                result.riskLevel === "HIGH" ? "risk-pulse" : ""
              }`}>
                {result.riskLevel}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">{result.summary}</span>
            </div>

            {/* Findings */}
            {result.findings?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  {t(lang, "findings")}
                </h3>
                <div className="space-y-3 stagger-children">
                  {result.findings.map((f, i) => (
                    <div key={i} className={`p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] card-glow finding-${f.severity.toLowerCase()}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${f.severity.toLowerCase()}`}>
                          {f.severity}
                        </span>
                        <span className="font-medium text-sm text-[var(--text-primary)]">{f.name}</span>
                        <span className="text-xs text-[var(--text-secondary)] ml-auto font-mono">{t(lang, "line")} {f.line}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{f.detail}</p>
                      <code className="text-xs text-yellow-300 bg-yellow-500/8 px-3 py-1.5 rounded-lg block overflow-x-auto font-mono border border-yellow-500/10">
                        {f.code}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation */}
            {result.aiExplanation && (
              <div className="p-5 rounded-xl glass-card animate-slideUp" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[var(--accent-glow)] border border-[var(--accent-border)] flex items-center justify-center text-[10px]">AI</span>
                  {t(lang, "aiAnalysis")}
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
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap mb-3 leading-relaxed">
                  {result.aiExplanation.explanation}
                </p>

                {result.aiExplanation.fixes?.length > 0 && (
                  <div className="space-y-3 mb-3">
                    <h4 className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      {t(lang, "suggestedFixes")}:
                    </h4>
                    {result.aiExplanation.fixes.map((fix, i) => (
                      <div key={i} className="text-sm p-3 rounded-lg bg-[rgba(0,255,136,0.03)] border border-[var(--accent-border)]">
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
                  <p className="text-sm text-blue-300 bg-blue-500/10 p-3 rounded-lg border border-blue-500/15">
                    {result.aiExplanation.overall_recommendation}
                  </p>
                )}
              </div>
            )}

            {/* On-chain proof */}
            {result.onChain && (
              <div className="p-4 rounded-xl bg-green-500/8 border border-green-500/20 animate-slideUp" style={{ animationDelay: "0.3s" }}>
                <h3 className="font-semibold text-sm mb-2 text-green-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
                  {t(lang, "onChainRecord")}
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-[var(--text-secondary)]">{t(lang, "txHash")}: </span>
                    <a
                      href={result.onChain.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs transition-colors"
                    >
                      {result.onChain.txHash}
                    </a>
                  </p>
                  <p>
                    <span className="text-[var(--text-secondary)]">{t(lang, "entryId")}: </span>
                    <span className="font-mono text-[var(--accent)]">{result.onChain.entryId}</span>
                  </p>
                  {result.onChain.gasUsed && result.onChain.gasUsed !== "N/A" && (
                    <p className="flex items-center gap-2 mt-1 pt-1 border-t border-[var(--border-color)]">
                      <span className="text-[var(--text-secondary)]">Gas: </span>
                      <span className="font-mono text-[var(--yellow)] text-xs">{Number(result.onChain.gasUsed).toLocaleString()}</span>
                      <span className="text-[var(--text-secondary)]">|</span>
                      <span className="font-mono text-[var(--yellow)] text-xs">{result.onChain.gasCost}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* EncryptedERC */}
            {result.encryption && (
              <div className="p-4 rounded-xl bg-purple-500/8 border border-purple-500/20 animate-slideUp" style={{ animationDelay: "0.35s" }}>
                <h3 className="font-semibold text-sm mb-2 text-purple-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  EncryptedERC
                </h3>
                <div className="space-y-1 text-xs font-mono text-[var(--text-secondary)]">
                  <p>{lang === "es" ? "Algoritmo" : "Algorithm"}: <span className="text-purple-300">{result.encryption.algorithm}</span></p>
                  <p>{lang === "es" ? "Derivacion de clave" : "Key derivation"}: <span className="text-purple-300">{result.encryption.keyDerivation}</span></p>
                  <p>{lang === "es" ? "Estado" : "Status"}: <span className="text-[var(--accent)]">{lang === "es" ? "Encriptado en blockchain" : "Encrypted on blockchain"}</span></p>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-2 opacity-70">
                  {lang === "es"
                    ? "El reporte completo esta encriptado on-chain. Solo el dueno del agente puede desencriptarlo."
                    : "The full report is encrypted on-chain. Only the agent owner can decrypt it."}
                </p>
              </div>
            )}

            {/* Payment info */}
            {result.payment && (
              <X402Tooltip cost={result.payment.cost} lang={lang} />
            )}
          </div>
        )}

        {!result && !error && !loading && (
          <div className="h-full min-h-[300px] flex items-center justify-center text-[var(--text-secondary)] text-sm">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--text-secondary)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p>{t(lang, "emptyContract")} "{t(lang, "analyzeBtn")}"</p>
              <p className="text-xs opacity-60">{t(lang, "emptyContractHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
