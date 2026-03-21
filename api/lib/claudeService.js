const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

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
            vulnerability: { type: "string" },
            fix: { type: "string" },
            code_example: { type: "string" },
          },
          required: ["vulnerability", "fix"],
        },
      },
      overall_recommendation: {
        type: "string",
        description: "Overall recommendation in Spanish. 1-2 sentences.",
      },
    },
    required: ["explanation", "fixes", "overall_recommendation"],
  },
};

async function explainContractAnalysis(sourceCode, analysis) {
  if (analysis.findings.length === 0) {
    return {
      explanation: "El contrato analizado no presenta vulnerabilidades conocidas.",
      fixes: [],
      overall_recommendation: "El contrato parece seguro, pero se recomienda una auditoría profesional.",
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
        content: `Eres un auditor de seguridad de smart contracts. Analiza estas vulnerabilidades y genera un reporte en español.

NIVEL DE RIESGO: ${analysis.riskLevel}

VULNERABILIDADES:
${findingsText}

CÓDIGO:
\`\`\`solidity
${sourceCode.substring(0, 2000)}
\`\`\`

Genera explicación clara en español, fixes con código corregido, y recomendación general.`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (toolUse) return toolUse.input;

  return {
    explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel de riesgo ${analysis.riskLevel}.`,
    fixes: analysis.findings.map((f) => ({ vulnerability: f.name, fix: f.description })),
    overall_recommendation: "Se recomienda corregir las vulnerabilidades antes de deployar.",
  };
}

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
        content: `Eres un asesor de seguridad Web3. Explica en español simple (máximo 3 oraciones) los riesgos:

Tipo: ${tx.type} | Monto: ${tx.amount} | Contrato: ${tx.contractAddress || "N/A"}

Riesgos:
${findingsText}

Responde en español, claro y directo. Máximo 3 oraciones.`,
      },
    ],
  });

  return {
    explanation: response.content[0].text,
    recommendation: analysis.findings[0].recommendation || "Revisa los detalles antes de confirmar.",
  };
}

module.exports = { explainContractAnalysis, explainTransactionRisk };
