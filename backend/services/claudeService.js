/**
 * Claude API Service — Uses Claude with tool_use for structured security analysis.
 *
 * Claude is used ONLY for generating human-readable explanations and fix suggestions.
 * The actual detection logic is rule-based (contractAnalyzer/txAnalyzer).
 */

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

// Tool definition for structured output
const SECURITY_ANALYSIS_TOOL = {
  name: "format_security_report",
  description: "Formats a security analysis report with explanation and fix suggestions in Spanish.",
  input_schema: {
    type: "object",
    properties: {
      explanation: {
        type: "string",
        description: "Clear explanation of the vulnerabilities found, in Spanish. 2-3 paragraphs max.",
      },
      fixes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            vulnerability: { type: "string", description: "Name of the vulnerability" },
            fix: { type: "string", description: "How to fix it, in Spanish" },
            code_example: { type: "string", description: "Corrected code snippet if applicable" },
          },
          required: ["vulnerability", "fix"],
        },
        description: "List of suggested fixes for each vulnerability found.",
      },
      overall_recommendation: {
        type: "string",
        description: "Overall recommendation for the developer, in Spanish. 1-2 sentences.",
      },
    },
    required: ["explanation", "fixes", "overall_recommendation"],
  },
};

/**
 * Generate a human-readable explanation of contract analysis findings.
 * @param {string} sourceCode - The analyzed Solidity code
 * @param {{ riskLevel: string, findings: Array, summary: string }} analysis - Rule-based analysis results
 * @returns {Promise<{ explanation: string, fixes: Array, overall_recommendation: string }>}
 */
async function explainContractAnalysis(sourceCode, analysis) {
  if (analysis.findings.length === 0) {
    return {
      explanation: "El contrato analizado no presenta vulnerabilidades conocidas según nuestras reglas de detección.",
      fixes: [],
      overall_recommendation: "El contrato parece seguro, pero se recomienda una auditoría profesional antes de deploy a mainnet.",
    };
  }

  const findingsText = analysis.findings
    .map((f) => `- ${f.name} (${f.severity}): ${f.detail} [línea ${f.line}]`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [SECURITY_ANALYSIS_TOOL],
    tool_choice: { type: "tool", name: "format_security_report" },
    messages: [
      {
        role: "user",
        content: `Eres un auditor de seguridad de smart contracts. Analiza estas vulnerabilidades encontradas en un contrato Solidity y genera un reporte en español.

NIVEL DE RIESGO: ${analysis.riskLevel}

VULNERABILIDADES ENCONTRADAS:
${findingsText}

CÓDIGO DEL CONTRATO (fragmento):
\`\`\`solidity
${sourceCode.substring(0, 2000)}
\`\`\`

Genera una explicación clara en español, sugiere fixes concretos con código corregido, y da una recomendación general.`,
      },
    ],
  });

  // Extract tool_use result
  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (toolUse) {
    return toolUse.input;
  }

  // Fallback if no tool_use response
  return {
    explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel de riesgo ${analysis.riskLevel}.`,
    fixes: analysis.findings.map((f) => ({
      vulnerability: f.name,
      fix: f.description,
    })),
    overall_recommendation: "Se recomienda corregir las vulnerabilidades antes de deployar el contrato.",
  };
}

/**
 * Generate a human-readable explanation of transaction risk.
 * @param {object} tx - Transaction data
 * @param {{ riskLevel: string, findings: Array, summary: string }} analysis
 * @returns {Promise<{ explanation: string, recommendation: string }>}
 */
async function explainTransactionRisk(tx, analysis) {
  if (analysis.findings.length === 0) {
    return {
      explanation: "La transacción no presenta riesgos detectables.",
      recommendation: "Puedes proceder con la transacción de forma segura.",
    };
  }

  const findingsText = analysis.findings
    .map((f) => `- ${f.name} (${f.severity}): ${f.warning}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Eres un asesor de seguridad Web3. Explica en español simple (máximo 3 oraciones) los riesgos de esta transacción:

Tipo: ${tx.type}
Monto: ${tx.amount}
Contrato: ${tx.contractAddress || "N/A"}

Riesgos encontrados:
${findingsText}

Responde en español, de forma clara y directa. Máximo 3 oraciones.`,
      },
    ],
  });

  return {
    explanation: response.content[0].text,
    recommendation: analysis.findings[0].recommendation || "Revisa los detalles antes de confirmar.",
  };
}

module.exports = { explainContractAnalysis, explainTransactionRisk };
