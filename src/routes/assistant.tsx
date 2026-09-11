import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, SendHorizonal, Sparkles, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BASE_SYSTEM, streamAI } from "@/lib/ai";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Workplace Assistant | Workplace AI" },
      {
        name: "description",
        content:
          "Ask practical workplace questions and get concise, action-oriented productivity guidance.",
      },
      { property: "og:title", content: "AI Workplace Assistant | Workplace AI" },
      {
        property: "og:description",
        content: "Plan your workday, prioritise tasks and draft professional messages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const SYSTEM = `${BASE_SYSTEM}
You are a chat assistant for workplace productivity: planning, prioritisation, delegation, meetings,
professional writing and workload management. Keep answers under 220 words unless the user asks for more.
Lead with the answer, then a short numbered list of next steps. Ask at most one clarifying question, and
only when you truly cannot answer without it.`;

const examples = [
  "Plan my workday.",
  "Help me prioritise these tasks.",
  "Draft a professional follow-up.",
  "Summarize this project.",
  "How can I manage my workload?",
];

type Message = { role: "user" | "assistant"; content: string };

const seed: Message[] = [
  { role: "user", content: "Plan my workday. I have three deadlines and back-to-back meetings." },
  {
    role: "assistant",
    content: `Protect two deep-work blocks around your meetings and let everything else move.

1. 08:30–10:00 — Take the deadline with the least flexibility first, before the meeting block starts.
2. 10:00–13:00 — Meetings. Keep a shared notes doc open so follow-ups are captured as you go, not afterwards.
3. 13:30–15:00 — Second deadline. Silence notifications and set a visible calendar hold.
4. 15:00–15:30 — Batch email, Slack and follow-ups from the morning in one pass.
5. 15:30–16:30 — Third deadline, or renegotiate it now if the first two ran long.

If all three genuinely land today, message the least-critical stakeholder early rather than late — a heads-up at 09:00 costs far less trust than a slipped deadline at 17:00.`,
  },
];

function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>(seed);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    const history = [...messages, { role: "user" as const, content: question }];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const transcript = history
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      setMessages([...history, { role: "assistant", content: "" }]);
      await streamAI({
        system: SYSTEM,
        prompt: `${transcript}\n\nAssistant:`,
        onDelta: (full) =>
          setMessages([...history, { role: "assistant" as const, content: full }]),
      });
    } catch (error) {
      setMessages(history);
      toast.error(error instanceof Error ? error.message : "The assistant could not respond.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <AppShell
      title="AI Workplace Assistant"
      description="Ask anything about planning, prioritising and professional communication."
    >
      <div className="surface-card flex h-[calc(100vh-15rem)] min-h-[520px] flex-col p-0 hover:shadow-card">
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div key={index} className="flex justify-end gap-3">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                  {message.content}
                </div>
                <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="size-4" />
                </span>
              </div>
            ) : (
              <div key={index} className="flex gap-3">
                <span className="gradient-hero mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  {message.content ? (
                    <>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {message.content}
                      </div>
                      <button
                        onClick={() => copy(message.content, index)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        {copiedIndex === index ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        {copiedIndex === index ? "Copied" : "Copy"}
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" /> Thinking it through...
                    </div>
                  )}
                </div>
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => send(example)}
                disabled={loading}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary-soft hover:text-accent-foreground disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about planning, prioritising, delegating or drafting a message..."
              className="max-h-40 min-h-[52px] resize-none bg-muted/40"
            />
            <Button
              size="icon"
              className="size-[52px] shrink-0"
              onClick={() => void send(input)}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SendHorizonal className="size-4" />
              )}
            </Button>
          </div>
          <AiDisclaimer className="mt-3" />
        </div>
      </div>
    </AppShell>
  );
}
