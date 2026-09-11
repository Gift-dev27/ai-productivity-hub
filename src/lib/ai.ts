export type StreamOptions = {
  system: string;
  prompt: string;
  jsonSchema?: { name: string; schema: Record<string, unknown> };
  onDelta?: (fullText: string) => void;
  signal?: AbortSignal;
};

export async function streamAI({
  system,
  prompt,
  jsonSchema,
  onDelta,
  signal,
}: StreamOptions): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, prompt, jsonSchema }),
    signal: signal ?? null,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("The assistant is busy right now. Try again shortly.");
    if (res.status === 402)
      throw new Error("AI usage limit reached. Add credits to keep generating.");
    throw new Error(detail?.slice(0, 200) || "The assistant could not respond.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onDelta?.(text);
  }

  return text;
}

export const BASE_SYSTEM =
  "You are an AI workplace productivity assistant for busy professionals. " +
  "Always be professional, concise and action-oriented. Use plain business English, " +
  "short paragraphs and bullet points. Prefer concrete next steps, owners and dates over generic advice. " +
  "Never invent confidential facts; if information is missing, state a reasonable assumption clearly.";
