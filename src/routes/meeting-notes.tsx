import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Loader2, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BASE_SYSTEM, streamAI } from "@/lib/ai";
import { sampleMeetingNotes, sampleMeetingOutput } from "@/lib/sample-data";
import { toast } from "sonner";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer | Workplace AI" },
      {
        name: "description",
        content:
          "Turn long meeting notes into a concise summary with decisions, action items, owners and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer | Workplace AI" },
      {
        property: "og:description",
        content: "Summarise meetings into decisions, action items, owners and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingNotesPage,
});

const SYSTEM = `${BASE_SYSTEM}
You summarise workplace meeting notes. Always reply in markdown with exactly these sections in this order:
## Summary (3-4 sentences)
## Key discussion points (bullets)
## Decisions made (bullets)
## Action items (markdown table with columns Action | Owner | Deadline)
## Deadlines at a glance (bullets)
If an owner or deadline is not stated, write "Unassigned" or "No date set". Never invent names.`;

function MeetingNotesPage() {
  const [notes, setNotes] = useState(sampleMeetingNotes);
  const [output, setOutput] = useState(sampleMeetingOutput);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!notes.trim()) {
      toast.error("Paste some meeting notes first.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      await streamAI({
        system: SYSTEM,
        prompt: `Summarise these meeting notes:\n\n${notes}`,
        onDelta: setOutput,
      });
      toast.success("Summary ready — edit anything before you share it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Summary copied");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Paste raw notes and get a shareable summary with owners and deadlines."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card flex flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Your meeting notes</h2>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotes(sampleMeetingNotes)}
                title="Load example notes"
              >
                <RotateCcw className="size-4" /> Example
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setNotes("")} title="Clear">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your meeting transcript or notes here..."
            className="mt-4 min-h-[380px] resize-y bg-muted/40 text-sm leading-relaxed"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : "No notes yet"}
            </span>
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "Summarising..." : "Summarise with AI"}
            </Button>
          </div>
        </section>

        <section className="surface-card flex flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">AI summary (editable)</h2>
            <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          {loading && !output ? (
            <div className="mt-4 flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-xl bg-muted/40 text-sm text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              Reading your notes and pulling out decisions...
            </div>
          ) : output ? (
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="mt-4 min-h-[380px] resize-y bg-muted/30 font-mono text-[13px] leading-relaxed"
            />
          ) : (
            <div className="mt-4 flex min-h-[380px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-6 text-center text-sm text-muted-foreground">
              <Sparkles className="size-6 text-primary" />
              Your summary, decisions, action items and deadlines will appear here.
            </div>
          )}
          <AiDisclaimer className="mt-4" />
        </section>
      </div>
    </AppShell>
  );
}
