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
    getDocsContext(),
  ].join("\n");
}

export async function askEngine(userPrompt: string, maxTokens = 4096): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: buildSystemPrompt(),
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
