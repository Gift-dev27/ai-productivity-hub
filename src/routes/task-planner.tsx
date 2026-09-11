import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Clock, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BASE_SYSTEM, streamAI } from "@/lib/ai";
import { priorityStyles, sampleTasks, type Priority, type Task } from "@/lib/sample-data";
import { toast } from "sonner";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner | Workplace AI" },
      {
        name: "description",
        content:
          "Add tasks with priority, deadline and duration, and let AI build a realistic time-blocked schedule.",
      },
      { property: "og:title", content: "AI Task Planner | Workplace AI" },
      {
        property: "og:description",
        content: "Turn a messy task list into a realistic time-blocked schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TaskPlannerPage,
});

type Block = {
  start: string;
  end: string;
  title: string;
  priority: string;
  focus: string;
};

const scheduleSchema = {
  type: "object",
  additionalProperties: false,
  required: ["day", "blocks", "note"],
  properties: {
    day: { type: "string" },
    note: { type: "string" },
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["start", "end", "title", "priority", "focus"],
        properties: {
          start: { type: "string" },
          end: { type: "string" },
          title: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low", "Break"] },
          focus: { type: "string" },
        },
      },
    },
  },
} as const;

const SYSTEM = `${BASE_SYSTEM}
You build realistic daily work schedules. Assume a working day of 08:30 to 17:00 with a lunch break and
short recovery breaks between deep-work blocks. Protect high-priority and deadline-bound work in the
morning, batch small tasks together, and never schedule more than 90 minutes of deep work without a break.
The "focus" field is one short sentence describing what "done" looks like for that block.`;

const initialSchedule: { day: string; note: string; blocks: Block[] } = {
  day: "Today",
  note: "Deep work is protected before 12:00. Admin and comms are batched into two short windows so they do not fragment the day.",
  blocks: [
    {
      start: "08:30",
      end: "09:00",
      title: "Plan the day and clear urgent messages",
      priority: "Medium",
      focus: "Inbox triaged and the top three outcomes for today written down.",
    },
    {
      start: "09:00",
      end: "10:30",
      title: "Finalise Q3 client onboarding deck",
      priority: "High",
      focus: "All slides drafted with the new pricing narrative and ready for review.",
    },
    {
      start: "10:30",
      end: "10:45",
      title: "Break",
      priority: "Break",
      focus: "Step away from the screen before the next deep-work block.",
    },
    {
      start: "10:45",
      end: "11:30",
      title: "Review vendor contract redlines",
      priority: "High",
      focus: "Every redline either accepted or flagged with a written objection.",
    },
    {
      start: "11:30",
      end: "12:00",
      title: "Update sprint capacity tracker",
      priority: "Low",
      focus: "Capacity reflects the two people on leave next week.",
    },
    {
      start: "12:00",
      end: "13:00",
      title: "Lunch",
      priority: "Break",
      focus: "Proper break away from the desk.",
    },
    {
      start: "13:00",
      end: "14:30",
      title: "Draft hiring brief for support analyst",
      priority: "Medium",
      focus: "Role scope, must-have skills and start date agreed in a shareable draft.",
    },
    {
      start: "14:30",
      end: "15:00",
      title: "Send follow-up notes to the Atlas team",
      priority: "Medium",
      focus: "Notes sent with owners and dates confirmed in writing.",
    },
    {
      start: "15:00",
      end: "16:00",
      title: "Buffer for escalations and review requests",
      priority: "Low",
      focus: "Absorbs overruns so the deck deadline at 16:00 still holds.",
    },
  ],
};

const blockTone: Record<string, string> = {
  High: "border-l-destructive",
  Medium: "border-l-warning",
  Low: "border-l-success",
  Break: "border-l-border",
};

function TaskPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("");
  const [schedule, setSchedule] = useState(initialSchedule);
  const [range, setRange] = useState<"day" | "week">("day");
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    if (!title.trim()) {
      toast.error("Give the task a name first.");
      return;
    }
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        priority,
        deadline: deadline.trim() || "No date set",
        duration: duration.trim() || "30 min",
        owner: "You",
        done: false,
      },
      ...prev,
    ]);
    setTitle("");
    setDeadline("");
    setDuration("");
  };

  const generate = async () => {
    if (tasks.length === 0) {
      toast.error("Add at least one task.");
      return;
    }
    setLoading(true);
    try {
      const list = tasks
        .filter((t) => !t.done)
        .map(
          (t) =>
            `- ${t.title} (priority: ${t.priority}, deadline: ${t.deadline}, estimated: ${t.duration}, owner: ${t.owner})`,
        )
        .join("\n");

      const raw = await streamAI({
        system: SYSTEM,
        prompt: `Build a realistic ${range === "day" ? "single-day" : "weekly"} schedule for these tasks. ${
          range === "week"
            ? 'Spread work across Monday to Friday and prefix each block title with the weekday, using the "day" field to say "This week".'
            : 'Set the "day" field to "Today".'
        }\n\n${list}`,
        jsonSchema: { name: "schedule", schema: scheduleSchema as unknown as Record<string, unknown> },
      });

      const parsed = JSON.parse(raw) as { day: string; note: string; blocks: Block[] };
      setSchedule(parsed);
      toast.success("Schedule ready — every block is editable.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not build a schedule.");
    } finally {
      setLoading(false);
    }
  };

  const updateBlock = (index: number, patch: Partial<Block>) => {
    setSchedule((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  };

  return (
    <AppShell
      title="AI Task Planner"
      description="Capture tasks, then let AI turn them into a realistic, time-blocked plan."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="surface-card h-fit p-5">
          <h2 className="text-base font-semibold">Add a task</h2>
          <div className="mt-4 space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What needs to get done?"
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High priority</SelectItem>
                  <SelectItem value="Medium">Medium priority</SelectItem>
                  <SelectItem value="Low">Low priority</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45 min"
              />
            </div>
            <Input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Deadline (e.g. Thu 16:00)"
            />
            <Button className="w-full" variant="secondary" onClick={addTask}>
              <Plus className="size-4" /> Add task
            </Button>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your tasks</h3>
              <span className="text-xs text-muted-foreground">
                {tasks.filter((t) => !t.done).length} open
              </span>
            </div>
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                No tasks yet. Add one above to get started.
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/40"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() =>
                      setTasks((prev) =>
                        prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
                      )
                    }
                    className="mt-1 size-4 accent-[var(--primary)]"
                    aria-label={`Mark ${task.title} complete`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${task.done ? "text-muted-foreground line-through" : ""}`}
                    >
                      {task.title}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={`rounded-full border px-2 py-0.5 ${priorityStyles[task.priority]}`}
                      >
                        {task.priority}
                      </span>
                      <span>{task.deadline}</span>
                      <span>· {task.duration}</span>
                    </p>
                  </div>
                  <button
                    aria-label="Remove task"
                    onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="surface-card flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h2 className="text-base font-semibold">{schedule.day} · AI schedule</h2>
              <p className="text-sm text-muted-foreground">
                Time blocks are editable — adjust anything that does not fit your day.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-muted p-1">
                {(["day", "week"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      range === r
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r === "day" ? "Daily" : "Weekly"}
                  </button>
                ))}
              </div>
              <Button onClick={generate} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {loading ? "Planning..." : "Generate plan"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
              ))}
              <p className="text-center text-sm text-muted-foreground">
                Balancing priorities, deadlines and focus time...
              </p>
            </div>
          ) : (
            <>
              {schedule.note && (
                <div className="rounded-xl bg-primary-soft/70 p-4 text-sm text-accent-foreground">
                  {schedule.note}
                </div>
              )}
              <ol className="space-y-3">
                {schedule.blocks.map((block, index) => (
                  <li
                    key={`${block.start}-${index}`}
                    className={`surface-card border-l-4 p-4 ${blockTone[block.priority] ?? "border-l-primary"}`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3.5" />
                        {block.start} – {block.end}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        {block.priority}
                      </span>
                    </div>
                    <Input
                      value={block.title}
                      onChange={(e) => updateBlock(index, { title: e.target.value })}
                      className="mt-3 border-transparent bg-transparent px-0 text-base font-semibold shadow-none focus-visible:border-input focus-visible:px-3"
                    />
                    <Textarea
                      value={block.focus}
                      onChange={(e) => updateBlock(index, { focus: e.target.value })}
                      className="mt-1 min-h-0 resize-none border-transparent bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:border-input focus-visible:px-3"
                      rows={2}
                    />
                  </li>
                ))}
              </ol>
              {schedule.blocks.length === 0 && (
                <div className="surface-card flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
                  <CalendarClock className="size-6 text-primary" />
                  Add tasks and generate a plan to see your schedule here.
                </div>
              )}
            </>
          )}
          <AiDisclaimer />
        </section>
      </div>
    </AppShell>
  );
}
