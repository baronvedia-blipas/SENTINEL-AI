/**
 * Contract Analyzer — Rule-based vulnerability detection for Solidity code.
 *
 * Detects:
 * 1. Reentrancy (external call before state update)
 * 2. Unlimited approvals (type(uint256).max)
 * 3. tx.origin authentication
 * 4. Missing require() on public functions
 * 5. Unchecked return values on .send() / .transfer()
 */

const VULNERABILITY_RULES = [
  {
    id: "REENTRANCY",
    name: "Reentrancy Vulnerability",
    severity: "HIGH",
    description: "External call detected before state variable update. An attacker could re-enter the function before state changes are applied.",
    detect: (code) => {
      // Normalize: split by semicolons AND newlines to handle single-line code
      const normalized = code.replace(/;/g, ";\n").replace(/\{/g, "{\n").replace(/\}/g, "\n}\n");
      const lines = normalized.split("\n");
      const results = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("//") || line.startsWith("*")) continue;

        // Detect .call{value:, .send(, .transfer( patterns
        const hasExternalCall = /\.(call\{|call\(|send\(|transfer\()/.test(line);
        if (!hasExternalCall) continue;

        // Look ahead for state updates after the external call
        for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (!nextLine || nextLine.startsWith("//") || nextLine.startsWith("*") || nextLine === "}") continue;

          // State update patterns: variable = , mapping[x] = , balances[
          if (/\w+\s*(\[.*\])?\s*=\s*[^=]/.test(nextLine)) {
            // Find the actual line number in original code
            const originalLine = code.substring(0, code.indexOf(line.substring(0, 20))).split("\n").length;
            results.push({
              line: originalLine,
              code: line,
              detail: `State update at line ${j + 1} happens AFTER external call at line ${i + 1}`,
            });
            break;
          }
        }
      }

      return results;
    },
  },
  {
    id: "UNLIMITED_APPROVAL",
    name: "Unlimited Token Approval",
    severity: "HIGH",
    description: "Unlimited approval detected (type(uint256).max or 2^256). An approved spender could drain all tokens.",
    detect: (code) => {
      const results = [];
      const lines = code.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;

        if (
          /type\s*\(\s*uint256\s*\)\s*\.\s*max/.test(line) ||
          /2\s*\*\*\s*256\s*-\s*1/.test(line) ||
          /uint256\s*\(\s*-1\s*\)/.test(line) ||
          /0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff/.test(line)
        ) {
          results.push({
            line: i + 1,
            code: line,
            detail: "Unlimited approval amount found",
          });
        }
      }

      return results;
    },
  },
  {
    id: "TX_ORIGIN",
    name: "tx.origin Authentication",
    severity: "HIGH",
    description: "Using tx.origin for authentication is dangerous. A malicious contract could trick a user into calling it, inheriting their tx.origin.",
    detect: (code) => {
      const results = [];
      const lines = code.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;

        if (/tx\.origin/.test(line) && /(require|if|==|!=)/.test(line)) {
          results.push({
            line: i + 1,
            code: line,
            detail: "tx.origin used for access control — use msg.sender instead",
          });
        }
      }

      return results;
    },
  },
  {
    id: "MISSING_REQUIRE",
    name: "Missing Input Validation",
    severity: "MEDIUM",
    description: "Public/external function without require() or modifier checks. Critical functions should validate inputs.",
    detect: (code) => {
      const results = [];
      const lines = code.split("\n");

      let inFunction = false;
      let functionLine = 0;
      let functionName = "";
      let braceDepth = 0;
      let hasRequire = false;
      let hasModifier = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect public/external function declarations
        const funcMatch = line.match(/function\s+(\w+)\s*\([^)]*\)\s*(external|public)/);
        if (funcMatch && !line.includes("view") && !line.includes("pure")) {
          inFunction = true;
          functionLine = i + 1;
          functionName = funcMatch[1];
          braceDepth = 0;
          hasRequire = false;
          // Check if there's a modifier on the function declaration
          hasModifier = /\)\s*(external|public)\s+\w+/.test(line) || /only\w+/i.test(line);
        }

        if (inFunction) {
          braceDepth += (line.match(/{/g) || []).length;
          braceDepth -= (line.match(/}/g) || []).length;

          if (/require\s*\(|revert\s|assert\s*\(/.test(line)) {
            hasRequire = true;
          }

          if (braceDepth === 0 && line.includes("}")) {
            if (!hasRequire && !hasModifier && functionName !== "constructor") {
              results.push({
                line: functionLine,
                code: `function ${functionName}`,
                detail: `Public function "${functionName}" has no require/revert checks`,
              });
            }
            inFunction = false;
          }
        }
      }

      return results;
    },
  },
  {
    id: "UNCHECKED_SEND",
    name: "Unchecked Return Value",
    severity: "MEDIUM",
    description: "The return value of .send() is not checked. If the send fails, execution continues silently.",
    detect: (code) => {
      const results = [];
      const lines = code.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;

        // .send( without require( or bool success
        if (/\.send\(/.test(line) && !/require\s*\(/.test(line) && !/bool\s+\w*success/.test(line)) {
          results.push({
            line: i + 1,
            code: line,
            detail: "Return value of .send() not checked — use require() or check the bool",
          });
        }
      }

      return results;
    },
  },
];

/**
 * Analyze Solidity source code for vulnerabilities.
 * @param {string} sourceCode - Raw Solidity source code
 * @returns {{ riskLevel: string, findings: Array, summary: string }}
 */
function isSolidityCode(code) {
  const indicators = [
    /pragma\s+solidity/i,
    /contract\s+\w+/,
    /function\s+\w+\s*\(/,
    /mapping\s*\(/,
    /uint256|uint128|address|bool|string|bytes/,
    /msg\.sender|msg\.value/,
    /require\s*\(/,
    /modifier\s+\w+/,
    /event\s+\w+/,
    /emit\s+\w+/,
  ];
  const matches = indicators.filter(re => re.test(code)).length;
  return matches >= 2;
}

function analyzeContract(sourceCode) {
  if (!sourceCode || typeof sourceCode !== "string") {
    return { riskLevel: "LOW", findings: [], summary: "No code provided", valid: false };
  }

  if (!isSolidityCode(sourceCode)) {
    return {
      riskLevel: "INVALID",
      findings: [],
      summary: "The input does not appear to be valid Solidity code.",
      valid: false,
    };
  }

  const findings = [];

  for (const rule of VULNERABILITY_RULES) {
    const matches = rule.detect(sourceCode);
    for (const match of matches) {
      findings.push({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        description: rule.description,
        line: match.line,
        code: match.code,
        detail: match.detail,
      });
    }
  }

  // Determine overall risk level
  const hasHigh = findings.some((f) => f.severity === "HIGH");
  const hasMedium = findings.some((f) => f.severity === "MEDIUM");

  let riskLevel = "LOW";
  if (hasHigh) riskLevel = "HIGH";
  else if (hasMedium) riskLevel = "MEDIUM";

  const summary = findings.length === 0
    ? "No vulnerabilities detected."
    : `Found ${findings.length} issue(s): ${findings.filter(f => f.severity === "HIGH").length} HIGH, ${findings.filter(f => f.severity === "MEDIUM").length} MEDIUM.`;

  return { riskLevel, findings, summary };
}

module.exports = { analyzeContract, VULNERABILITY_RULES };
