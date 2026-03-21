/**
 * AI Service — Supports Claude (presentation) or Gemini (testing).
 * Set GEMINI_API_KEY to use Gemini. Otherwise uses Claude.
 */

const useGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "sk-gem-XXXXX";

// ── Gemini helper ──
async function geminiChat(prompt, maxTokens = 1024) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ── Claude helper ──
async function claudeChat(messages, options = {}) {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic();
  return client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: options.maxTokens || 1024,
    ...options,
    messages,
  });
}

// ── Contract Analysis Explanation ──
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

  const prompt = `Eres un auditor de seguridad de smart contracts. Analiza estas vulnerabilidades y genera un reporte en español.

NIVEL DE RIESGO: ${analysis.riskLevel}

VULNERABILIDADES:
${findingsText}

CÓDIGO:
\`\`\`solidity
${sourceCode.substring(0, 2000)}
\`\`\`

Responde en JSON estricto con esta estructura (sin markdown, solo JSON):
{
  "explanation": "explicación clara en español, 2-3 párrafos",
  "fixes": [{"vulnerability": "nombre", "fix": "cómo arreglar en español", "code_example": "código corregido"}],
  "overall_recommendation": "recomendación general en español, 1-2 oraciones"
}`;

  if (useGemini) {
    try {
      const text = await geminiChat(prompt);
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("[Gemini]", err.message);
    }
  } else {
    try {
      const TOOL = {
        name: "format_security_report",
        description: "Formats a security analysis report in Spanish.",
        input_schema: {
          type: "object",
          properties: {
            explanation: { type: "string" },
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
            overall_recommendation: { type: "string" },
          },
          required: ["explanation", "fixes", "overall_recommendation"],
        },
      };

      const response = await claudeChat(
        [{ role: "user", content: prompt }],
        { tools: [TOOL], tool_choice: { type: "tool", name: "format_security_report" } }
      );
      const toolUse = response.content.find((b) => b.type === "tool_use");
      if (toolUse) return toolUse.input;
    } catch (err) {
      console.error("[Claude]", err.message);
    }
  }

  // Fallback
  return {
    explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel de riesgo ${analysis.riskLevel}.`,
    fixes: analysis.findings.map((f) => ({ vulnerability: f.name, fix: f.description })),
    overall_recommendation: "Se recomienda corregir las vulnerabilidades antes de deployar.",
  };
}

// ── Transaction Risk Explanation ──
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

  const prompt = `Eres un asesor de seguridad Web3. Explica en español simple (máximo 3 oraciones) los riesgos:

Tipo: ${tx.type} | Monto: ${tx.amount} | Contrato: ${tx.contractAddress || "N/A"}

Riesgos:
${findingsText}

Responde en español, claro y directo. Máximo 3 oraciones.`;

  try {
    if (useGemini) {
      const text = await geminiChat(prompt, 512);
      return { explanation: text, recommendation: analysis.findings[0].recommendation || "Revisa los detalles." };
    } else {
      const response = await claudeChat([{ role: "user", content: prompt }], { maxTokens: 512 });
      return { explanation: response.content[0].text, recommendation: analysis.findings[0].recommendation || "Revisa los detalles." };
    }
  } catch (err) {
    console.error("[AI]", err.message);
    return { explanation: analysis.summary, recommendation: "Verifica los detalles de la transacción." };
  }
}

module.exports = { explainContractAnalysis, explainTransactionRisk };
