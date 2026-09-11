export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  deadline: string;
  duration: string;
  owner: string;
  done: boolean;
};

export const sampleTasks: Task[] = [
  {
    id: "t1",
    title: "Finalise Q3 client onboarding deck",
    priority: "High",
    deadline: "Today, 16:00",
    duration: "90 min",
    owner: "You",
    done: false,
  },
  {
    id: "t2",
    title: "Review vendor contract redlines",
    priority: "High",
    deadline: "Tomorrow, 10:00",
    duration: "45 min",
    owner: "You",
    done: false,
  },
  {
    id: "t3",
    title: "Send follow-up notes to the Atlas team",
    priority: "Medium",
    deadline: "Today, 17:30",
    duration: "20 min",
    owner: "You",
    done: true,
  },
  {
    id: "t4",
    title: "Draft hiring brief for support analyst",
    priority: "Medium",
    deadline: "Thu, 12:00",
    duration: "60 min",
    owner: "Naledi",
    done: false,
  },
  {
    id: "t5",
    title: "Update sprint capacity tracker",
    priority: "Low",
    deadline: "Fri, 15:00",
    duration: "30 min",
    owner: "You",
    done: false,
  },
];

export const recentMeetings = [
  {
    id: "m1",
    title: "Atlas platform migration sync",
    when: "Today, 09:00",
    attendees: 6,
    summary:
      "The team confirmed the migration will run in two phases. Phase one moves reporting workloads next Friday; phase two moves billing once the data validation script passes.",
    actions: 4,
  },
  {
    id: "m2",
    title: "Quarterly marketing review",
    when: "Yesterday, 14:30",
    attendees: 9,
    summary:
      "Pipeline is 12% ahead of target, driven by the partner webinar series. Budget for paid search will be reallocated to lifecycle email for the next six weeks.",
    actions: 3,
  },
  {
    id: "m3",
    title: "Customer support escalation review",
    when: "Mon, 11:00",
    attendees: 4,
    summary:
      "Two recurring escalations traced to the same billing edge case. A hotfix ships Wednesday and the macro library will be rewritten before month-end.",
    actions: 5,
  },
];

export const sampleMeetingNotes = `Weekly product & operations sync - 45 minutes
Attendees: Thabo (Product), Naledi (Ops), Priya (Engineering), Marcus (Customer Success)

Thabo opened by walking through the Atlas migration timeline. Engineering has finished the data mapping but the validation script still fails on roughly 3% of legacy billing records. Priya said this is mostly historical currency formatting and she can patch it, but she needs two clear days without other interruptions. The group agreed the reporting workloads move first on Friday the 18th, and billing follows only once validation passes at 100%.

Naledi raised that support ticket volume has climbed 18% month over month. Marcus confirmed most of the increase is a single billing edge case where annual customers who upgrade mid-cycle see a duplicate invoice line. A hotfix is ready but not yet scheduled. Priya offered Wednesday for the release. Marcus will rewrite the support macro library once the fix is live so agents stop giving inconsistent answers.

There was a longer discussion about hiring. Naledi wants a support analyst in place before the migration to absorb the extra load. Thabo pushed back on the timing and budget, and they settled on posting the role now with a start date after the migration. Naledi will draft the hiring brief by Thursday and share it with Thabo for sign off.

Finally the group reviewed the quarterly board update. Thabo needs a one-page summary of the migration risks by the end of next week. Priya will provide technical risk notes, Marcus will provide customer impact notes, and Thabo will assemble the final page.`;

export const sampleMeetingOutput = `## Summary
The team confirmed a phased Atlas migration, agreed a Wednesday hotfix for the duplicate invoice issue, and settled the timing of a support analyst hire. A one-page migration risk summary is due for the board next week.

## Key discussion points
- Data mapping is complete, but validation still fails on ~3% of legacy billing records due to historical currency formatting.
- Support ticket volume is up 18% month over month, driven mainly by duplicate invoice lines for mid-cycle upgrades.
- Hiring a support analyst before the migration was debated on budget and timing grounds.
- The board update needs a consolidated view of technical and customer risk.

## Decisions made
- Reporting workloads migrate first on Friday the 18th; billing migrates only after validation passes at 100%.
- The duplicate invoice hotfix ships on Wednesday.
- The support analyst role is posted now, with a start date after the migration.

## Action items
| Action | Owner | Deadline |
| --- | --- | --- |
| Patch currency formatting and rerun validation | Priya | Thu 17th |
| Release duplicate invoice hotfix | Priya | Wed 16th |
| Rewrite support macro library after the fix | Marcus | Fri 25th |
| Draft support analyst hiring brief | Naledi | Thu 17th |
| Assemble one-page board risk summary | Thabo | Fri 25th |

## Deadlines at a glance
- Wed 16th - hotfix release
- Thu 17th - validation rerun and hiring brief
- Fri 18th - reporting workload migration
- Fri 25th - macro library and board summary`;

export const priorityStyles: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive border-destructive/20",
  Medium: "bg-warning/15 text-warning-foreground border-warning/30",
  Low: "bg-success/12 text-success border-success/25",
};
