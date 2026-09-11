import { createFileRoute } from "@tanstack/react-router";

type Body = {
  system?: string;
  prompt?: string;
  jsonSchema?: { name: string; schema: Record<string, unknown> };
};

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        if (!body?.prompt) return new Response("Prompt is required", { status: 400 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured", { status: 500 });

        const payload: Record<string, unknown> = {
          model: "openai/gpt-6-astra",
          stream: true,
          reasoning: { effort: "low" },
          input: [
            {
              role: "system",
              content: [{ type: "input_text", text: body.system ?? "" }],
            },
            {
              role: "user",
              content: [{ type: "input_text", text: body.prompt }],
            },
          ],
        };

        if (body.jsonSchema) {
          payload["text"] = {
            format: {
              type: "json_schema",
              name: body.jsonSchema.name,
              strict: true,
              schema: body.jsonSchema.schema,
            },
          };
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify(payload),
          signal: request.signal,
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          return new Response(detail || "AI request failed", {
            status: upstream.status || 500,
          });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const reader = upstream.body.getReader();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              const data = line.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const event = JSON.parse(data) as { type?: string; delta?: string };
                if (event.type === "response.output_text.delta" && event.delta) {
                  controller.enqueue(encoder.encode(event.delta));
                }
              } catch {
                /* ignore keep-alive / partial frames */
              }
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
