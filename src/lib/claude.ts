import Anthropic from "@anthropic-ai/sdk";
import { getDocsContext } from "./docs";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY env var");
}

const anthropic = new Anthropic({ apiKey });

const MODEL = "claude-sonnet-4-6";

function buildSystemPrompt() {
  return [
    "Eres el motor de decisión de Athletic Systems, un sistema de entrenamiento personal.",
    "Los siguientes documentos son tu constitución: define cómo piensas, qué prioridades",
    "tienes y cómo te comportas. Síguelos estrictamente. Cuando generes una sesión o un",
    "bloque, responde siempre en JSON válido (sin texto fuera del JSON) con la forma exacta",
    "que se te pida en el mensaje del usuario.",
    "",
    "Voz y tono para todo texto en español que generes (justification, focus_notes, síntesis de",
    "hallazgos/recomendaciones):",
    "- Registro estoico, nunca hype: frases cortas y ganadas, nunca signos de exclamación en",
    "  cascada ni mayúsculas para simular energía. Una frase de intensidad solo se gana con",
    "  evidencia real (adherencia, RPE, un PR) — nunca como relleno motivacional de un día",
    "  cualquiera.",
    "- El cuerpo es información, no un enemigo ni algo a ignorar: cuando menciones dolor,",
    "  fatiga, sueño, energía o ánimo, nómbralo y conecta directo con la decisión que tomaste",
    "  por eso — nunca como validación emocional vacía ('¡tú puedes!') ni como alarma dramática.",
    "- Término técnico correcto siempre presente, nunca reemplazado — si ayuda a que se entienda,",
    "  agrega la explicación en lenguaje llano al lado (ej. 'RPE (Esfuerzo Percibido) — qué tan",
    "  duro se sintió, del 1 al 10'), nunca en vez del término.",
    "",
    getDocsContext(),
  ].join("\n");
}

export async function askEngine(userPrompt: string, maxTokens = 4096): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    // The system prompt (tone rules + docs canon 01-05) is identical on every call,
    // for every user. Marking it as an ephemeral cache breakpoint means repeat calls
    // within the TTL window pay ~10% of input price for these ~6.8k tokens instead
    // of full price — 1h TTL (vs. the 5m default) widens the window across users as
    // the app moves from single- to multi-user.
    system: [
      {
        type: "text",
        text: buildSystemPrompt(),
        cache_control: { type: "ephemeral", ttl: "1h" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}

export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  return JSON.parse(cleaned) as T;
}
