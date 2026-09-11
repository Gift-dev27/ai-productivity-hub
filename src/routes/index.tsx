import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { priorityStyles, recentMeetings, sampleTasks } from "@/lib/sample-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workplace AI · Productivity Dashboard" },
      {
        name: "description",
        content:
          "A calm AI productivity workspace: today's overview, upcoming tasks, meeting summaries and priority work in one dashboard.",
      },
      { property: "og:title", content: "Workplace AI · Productivity Dashboard" },
      {
        property: "og:description",
        content: "Today's overview, upcoming tasks, meeting summaries and priority work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Tasks completed today", value: "6 of 11", icon: CheckCircle2, hint: "+2 vs yesterday" },
  { label: "Focus time protected", value: "3h 45m", icon: Clock, hint: "Target 4h" },
  { label: "Meetings summarised", value: "3", icon: Users, hint: "12 action items captured" },
  { label: "Productivity score", value: "82%", icon: TrendingUp, hint: "Steady week" },
];

const quickActions = [
  {
    to: "/meeting-notes",
    title: "Summarise meeting notes",
    copy: "Turn a messy transcript into decisions, owners and deadlines.",
    icon: FileText,
  },
  {
    to: "/task-planner",
    title: "Plan my day",
    copy: "Time-block your tasks around priorities and real deadlines.",
    icon: CalendarClock,
  },
  {
    to: "/assistant",
    title: "Ask the assistant",
    copy: "Prioritise work, draft a follow-up or unblock a decision.",
    icon: Bot,
  },
] as const;

function Dashboard() {
  const upcoming = sampleTasks.filter((t) => !t.done);
  const priority = upcoming.filter((t) => t.priority === "High");

  return (
    <AppShell
      title="Good morning, Mpho"
      description="Here is how today is shaping up across your tasks and meetings."
    >
      <div className="space-y-6">
        <section className="gradient-hero relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-lift sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm/6 opacity-90">Today's productivity overview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              You have 5 open tasks and 2 that genuinely matter today.
            </h2>
            <p className="mt-3 text-sm/6 opacity-90">
              The onboarding deck is due at 16:00 and the vendor redlines block tomorrow's call.
              Everything else can move if the day gets tight.
            </p>
            <Link
              to="/task-planner"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              Build today's plan <ArrowRight className="size-4" />
            </Link>
          </div>
          <AiDisclaimer className="mt-6 text-primary-foreground/80 [&_svg]:text-primary-foreground" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, hint, icon: Icon }) => (
            <div key={label} className="surface-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-accent-foreground">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map(({ to, title, copy, icon: Icon }) => (
            <Link key={to} to={to} className="surface-card group p-5 hover:-translate-y-0.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 flex items-center gap-2 text-base font-semibold">
                {title}
                <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
            </Link>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Upcoming tasks</h2>
              <Link
                to="/task-planner"
                className="text-sm font-medium text-primary hover:underline"
              >
                View planner
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {upcoming.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {task.deadline} · {task.duration} · {task.owner}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Flame className="size-4 text-destructive" /> Priority today
            </h2>
            <ul className="mt-4 space-y-3">
              {priority.map((task) => (
                <li key={task.id} className="rounded-xl bg-primary-soft/60 p-3">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Due {task.deadline}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/assistant"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Ask how to sequence these <ArrowRight className="size-4" />
            </Link>
          </section>
        </div>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent meeting summaries</h2>
            <Link to="/meeting-notes" className="text-sm font-medium text-primary hover:underline">
              Summarise a meeting
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {recentMeetings.map((meeting) => (
              <article
                key={meeting.id}
                className="rounded-xl border border-border p-4 transition-colors hover:bg-accent/30"
              >
                <h3 className="text-sm font-semibold">{meeting.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {meeting.when} · {meeting.attendees} attendees
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {meeting.summary}
                </p>
                <p className="mt-3 text-xs font-medium text-primary">
                  {meeting.actions} action items captured
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
