/**
 * AI Service — Supports Claude (presentation) or Gemini (testing).
 * Set GEMINI_API_KEY to use Gemini. Otherwise uses Claude.
 */

const useGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "sk-gem-XXXXX";

// ── Gemini helper ──
async function geminiChat(prompt, maxTokens = 1024) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
  // Gemini 2.5 may return multiple parts (thinking + text), get the last text part
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textPart = parts.filter(p => p.text).pop();
  return textPart?.text || "";
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
async function explainContractAnalysis(sourceCode, analysis, lang = "es") {
  if (analysis.findings.length === 0) {
    return lang === "en"
      ? { explanation: "The analyzed contract has no known vulnerabilities.", fixes: [], overall_recommendation: "The contract appears safe, but a professional audit is recommended." }
      : { explanation: "El contrato analizado no presenta vulnerabilidades conocidas.", fixes: [], overall_recommendation: "El contrato parece seguro, pero se recomienda una auditoría profesional." };
  }

  const findingsText = analysis.findings
    .slice(0, 5)  // Limit to 5 findings to avoid overwhelming the AI
    .map((f) => `- ${f.name} (${f.severity}): ${f.detail} [línea ${f.line}]`)
    .join("\n");

  const isEn = lang === "en";

  const prompt = isEn
    ? `You are a smart contract security auditor. Analyze these vulnerabilities and generate a report ENTIRELY IN ENGLISH. Every field must be in English.

RISK LEVEL: ${analysis.riskLevel}

VULNERABILITIES:
${findingsText}

CODE:
\`\`\`solidity
${sourceCode.substring(0, 2000)}
\`\`\`

Respond in strict JSON only (no markdown, no code fences, just JSON):
{
  "explanation": "clear explanation in English, 2-3 paragraphs",
  "fixes": [{"vulnerability": "name", "fix": "how to fix in English", "code_example": "corrected code"}],
  "overall_recommendation": "general recommendation in English, 1-2 sentences"
}`
    : `Eres un auditor de seguridad de smart contracts. Analiza estas vulnerabilidades y genera un reporte COMPLETAMENTE EN ESPAÑOL. Cada campo debe estar en español.

NIVEL DE RIESGO: ${analysis.riskLevel}

VULNERABILIDADES:
${findingsText}

CÓDIGO:
\`\`\`solidity
${sourceCode.substring(0, 2000)}
\`\`\`

Responde en JSON estricto (sin markdown, sin code fences, solo JSON):
{
  "explanation": "explicación clara en español, 2-3 párrafos",
  "fixes": [{"vulnerability": "nombre", "fix": "cómo arreglar en español", "code_example": "código corregido"}],
  "overall_recommendation": "recomendación general en español, 1-2 oraciones"
}`;

  if (useGemini) {
    try {
      const text = await geminiChat(prompt, 2048);
      console.log("[Gemini] Response length:", text.length, "chars");
      // Try multiple parse strategies
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

      // Strategy 1: Direct parse
      try { const p = JSON.parse(cleaned); p._provider = "gemini-2.5-flash"; return p; } catch {}

      // Strategy 2: Find JSON object with balanced braces
      let depth = 0, start = -1;
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === "{" && start === -1) start = i;
        if (cleaned[i] === "{") depth++;
        if (cleaned[i] === "}") depth--;
        if (depth === 0 && start !== -1) {
          try {
            const parsed = JSON.parse(cleaned.substring(start, i + 1));
            if (parsed.explanation) {
              console.log("[Gemini] Parsed OK");
              parsed._provider = "gemini-2.5-flash";
              return parsed;
            }
          } catch {}
          start = -1;
        }
      }

      // Strategy 3: Extract fields manually
      const explanationMatch = cleaned.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const recommendationMatch = cleaned.match(/"overall_recommendation"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (explanationMatch) {
        console.log("[Gemini] Manual extract OK");
        return {
          explanation: explanationMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
          fixes: analysis.findings.map(f => ({ vulnerability: f.name, fix: f.description })),
          overall_recommendation: recommendationMatch?.[1] || "Se recomienda corregir las vulnerabilidades.",
          _provider: "gemini-2.5-flash",
        };
      }

      // Strategy 4: Use raw text as explanation (better than fallback)
      console.log("[Gemini] Using raw text as explanation");
      return {
        explanation: cleaned.substring(0, 1500),
        fixes: analysis.findings.map(f => ({ vulnerability: f.name, fix: f.description })),
        overall_recommendation: isEn ? "Fix all vulnerabilities before deploying." : "Se recomienda corregir las vulnerabilidades antes de deployar.",
        _provider: "gemini-2.5-flash",
      };
    } catch (err) {
      console.error("[Gemini] Error:", err.message);
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
      if (toolUse) return { ...toolUse.input, _provider: "claude-sonnet-4" };
    } catch (err) {
      console.error("[Claude]", err.message);
    }
  }

  // Fallback — no AI used
  return isEn
    ? { explanation: `Found ${analysis.findings.length} vulnerabilities with risk level ${analysis.riskLevel}.`, fixes: analysis.findings.map((f) => ({ vulnerability: f.name, fix: f.description })), overall_recommendation: "Fix all vulnerabilities before deploying.", _provider: "fallback" }
    : { explanation: `Se encontraron ${analysis.findings.length} vulnerabilidades con nivel de riesgo ${analysis.riskLevel}.`, fixes: analysis.findings.map((f) => ({ vulnerability: f.name, fix: f.description })), overall_recommendation: "Se recomienda corregir las vulnerabilidades antes de deployar.", _provider: "fallback" };
}

// ── Transaction Risk Explanation ──
async function explainTransactionRisk(tx, analysis, lang = "es") {
  if (analysis.findings.length === 0) {
    return lang === "en"
      ? { explanation: "The transaction has no detectable risks.", recommendation: "You can proceed safely." }
      : { explanation: "La transacción no presenta riesgos detectables.", recommendation: "Puedes proceder con la transacción de forma segura." };
  }

  const findingsText = analysis.findings
    .map((f) => `- ${f.name} (${f.severity}): ${f.warning}`)
    .join("\n");

  const isEn = lang === "en";

  const prompt = isEn
    ? `You are a Web3 security advisor. Explain in simple English (max 3 sentences) the risks. RESPOND ENTIRELY IN ENGLISH.

Type: ${tx.type} | Amount: ${tx.amount} | Contract: ${tx.contractAddress || "N/A"}

Risks:
${findingsText}

Respond in English, clear and direct. Maximum 3 sentences.`
    : `Eres un asesor de seguridad Web3. Explica en español simple (máximo 3 oraciones) los riesgos. RESPONDE COMPLETAMENTE EN ESPAÑOL.

Tipo: ${tx.type} | Monto: ${tx.amount} | Contrato: ${tx.contractAddress || "N/A"}

Riesgos:
${findingsText}

Responde en español, claro y directo. Máximo 3 oraciones.`;

  try {
    if (useGemini) {
      const text = await geminiChat(prompt, 512);
      return { explanation: text, recommendation: analysis.findings[0].recommendation || "Revisa los detalles.", _provider: "gemini-2.5-flash" };
    } else {
      const response = await claudeChat([{ role: "user", content: prompt }], { maxTokens: 512 });
      return { explanation: response.content[0].text, recommendation: analysis.findings[0].recommendation || "Revisa los detalles.", _provider: "claude-sonnet-4" };
    }
  } catch (err) {
    console.error("[AI]", err.message);
    return { explanation: analysis.summary, recommendation: "Verifica los detalles de la transacción.", _provider: "fallback" };
  }
}

module.exports = { explainContractAnalysis, explainTransactionRisk };
