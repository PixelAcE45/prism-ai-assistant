import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dot, GlassPanel, PageHeader } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Nexus AI OS" },
      {
        name: "description",
        content:
          "Track today's work in Nexus: priorities, owners, due dates and progress across every workspace.",
      },
      { property: "og:title", content: "Tasks — Nexus AI OS" },
      { property: "og:description", content: "Priorities, owners and due dates across Nexus." },
    ],
  }),
  component: TasksPage,
});

type Task = {
  id: number;
  title: string;
  workspace: string;
  due: string;
  priority: "High" | "Medium" | "Low";
  done: boolean;
};

const seed: Task[] = [
  { id: 1, title: "Finalise Nexus Pro pricing copy", workspace: "Product Launch", due: "Today", priority: "High", done: false },
  { id: 2, title: "Review Q2 analytics report", workspace: "Nexus HQ", due: "Today", priority: "Medium", done: false },
  { id: 3, title: "Approve onboarding email sequence", workspace: "Client Success", due: "Tomorrow", priority: "Medium", done: false },
  { id: 4, title: "Draft hiring plan for design", workspace: "Nexus HQ", due: "Thu", priority: "Low", done: false },
  { id: 5, title: "Ship glass component refresh", workspace: "Product Launch", due: "Yesterday", priority: "High", done: true },
];

const priorityTone: Record<Task["priority"], string> = {
  High: "bg-rose",
  Medium: "bg-amber",
  Low: "bg-mint",
};

function TasksPage() {
  const [tasks, setTasks] = useState(seed);
  const [filter, setFilter] = useState("open");
  const [title, setTitle] = useState("");

  const visible = tasks.filter((task) =>
    filter === "all" ? true : filter === "done" ? task.done : !task.done,
  );

  const add = () => {
    if (!title.trim()) {
      toast("Describe the task first");
      return;
    }
    setTasks((current) => [
      { id: Date.now(), title: title.trim(), workspace: "Nexus HQ", due: "Today", priority: "Medium", done: false },
      ...current,
    ]);
    setTitle("");
    toast.success("Task added");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Tasks"
        description="Everything on your plate, grouped by urgency instead of by tool."
        actions={
          <Button
            onClick={add}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add task
          </Button>
        }
      />

      <GlassPanel className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && add()}
          placeholder="What needs to get done?"
          className="border-glass-border bg-glass"
        />
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-glass">
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </GlassPanel>

      <GlassPanel className="divide-y divide-[var(--hairline)] p-2">
        {visible.map((task) => (
          <div key={task.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3.5">
            <Checkbox
              checked={task.done}
              onCheckedChange={() =>
                setTasks((current) =>
                  current.map((item) =>
                    item.id === task.id ? { ...item, done: !item.done } : item,
                  ),
                )
              }
              aria-label={`Toggle ${task.title}`}
            />
            <div className="min-w-0">
              <p
                className={
                  task.done
                    ? "truncate text-sm text-muted-foreground line-through"
                    : "truncate text-sm font-medium"
                }
              >
                {task.title}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{task.workspace}</span>
                <span aria-hidden>·</span>
                <span>{task.due}</span>
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              <Dot className={priorityTone[task.priority]} />
              {task.priority}
            </span>
          </div>
        ))}
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Nothing here. Enjoy the quiet.
          </p>
        ) : null}
      </GlassPanel>
    </div>
  );
}
