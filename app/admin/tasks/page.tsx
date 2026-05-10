"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Check, Clock, Flag, Archive, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTasksStore, useTasks, type Task, type TaskPriority, type TaskStatus } from "@/lib/store/tasks"
import { cn } from "@/lib/utils"

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-amber-600",
  urgent: "text-red-600",
}
const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "низький",
  normal: "звичайний",
  high: "високий",
  urgent: "терміновий",
}

export default function AdminTasksPage() {
  const tasks = useTasks()
  const add = useTasksStore((s) => s.add)
  const update = useTasksStore((s) => s.update)
  const toggle = useTasksStore((s) => s.toggle)
  const remove = useTasksStore((s) => s.remove)
  const archive = useTasksStore((s) => s.archive)

  const [filter, setFilter] = useState<"open" | "done" | "all" | "overdue">("open")
  const [q, setQ] = useState("")
  const [newTitle, setNewTitle] = useState("")
  const [newPriority, setNewPriority] = useState<TaskPriority>("normal")
  const [newDue, setNewDue] = useState<string>("")

  const now = Date.now()
  const filtered = useMemo(() => {
    let list = tasks.slice()
    if (filter === "open") list = list.filter((t) => t.status === "open")
    else if (filter === "done") list = list.filter((t) => t.status === "done")
    else if (filter === "overdue") list = list.filter((t) => t.status === "open" && t.dueAt && t.dueAt < now)
    if (q) list = list.filter((t) => (t.title + " " + (t.note || "") + " " + t.tags.join(" ")).toLowerCase().includes(q.toLowerCase()))
    return list.sort((a, b) => {
      // Overdue first, then by dueAt, then priority, then createdAt
      const ao = a.dueAt && a.dueAt < now ? 0 : 1
      const bo = b.dueAt && b.dueAt < now ? 0 : 1
      if (ao !== bo) return ao - bo
      if (a.dueAt && b.dueAt && a.dueAt !== b.dueAt) return a.dueAt - b.dueAt
      const pOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
      if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority]
      return b.createdAt - a.createdAt
    })
  }, [tasks, filter, q, now])

  const counts = {
    open: tasks.filter((t) => t.status === "open").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter((t) => t.status === "open" && t.dueAt && t.dueAt < now).length,
    all: tasks.length,
  }

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    add({
      title: newTitle.trim(),
      priority: newPriority,
      dueAt: newDue ? new Date(newDue).getTime() : undefined,
      tags: [],
    })
    setNewTitle("")
    setNewDue("")
    setNewPriority("normal")
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight-custom">Задачі</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Особисті нагадування: подзвонити клієнту, надіслати ескіз, перевірити монтаж. Прив'язуються до замовлень.
        </p>
      </header>

      <form
        onSubmit={submitNew}
        className="flex flex-col gap-2 rounded-2xl border border-foreground/10 bg-card p-4 md:flex-row md:items-center"
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Нова задача…"
          className="flex-1"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
          className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
        >
          <option value="low">🔵 Низький</option>
          <option value="normal">⚪ Звичайний</option>
          <option value="high">🟡 Високий</option>
          <option value="urgent">🔴 Терміновий</option>
        </select>
        <Input
          type="datetime-local"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
          className="md:w-56"
        />
        <Button type="submit" className="rounded-xl gap-2">
          <Plus size={16} /> Додати
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-foreground/5 p-1">
          {(
            [
              ["open", `Відкриті · ${counts.open}`],
              ["overdue", `Прострочено · ${counts.overdue}`],
              ["done", `Виконано · ${counts.done}`],
              ["all", `Всі · ${counts.all}`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Input placeholder="Пошук задач…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-sm text-muted-foreground">
            Немає задач
          </div>
        ) : (
          filtered.map((t) => <Row key={t.id} task={t} onToggle={() => toggle(t.id)} onRemove={() => remove(t.id)} onArchive={() => archive(t.id)} onUpdate={(p) => update(t.id, p)} />)
        )}
      </div>
    </div>
  )
}

function Row({
  task,
  onToggle,
  onRemove,
  onArchive,
  onUpdate,
}: {
  task: Task
  onToggle: () => void
  onRemove: () => void
  onArchive: () => void
  onUpdate: (p: Partial<Task>) => void
}) {
  const overdue = task.status === "open" && task.dueAt && task.dueAt < Date.now()
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-3 rounded-2xl border border-foreground/10 bg-card p-4",
        task.status === "done" && "opacity-60"
      )}
    >
      <button
        onClick={onToggle}
        aria-label={task.status === "done" ? "Відкрити" : "Виконати"}
        className={cn(
          "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          task.status === "done" ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground"
        )}
      >
        {task.status === "done" && <Check size={12} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn("font-medium", task.status === "done" && "line-through")}>{task.title}</div>
        {task.note && <div className="mt-1 text-sm text-muted-foreground">{task.note}</div>}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {task.dueAt && (
            <span className={cn("inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5", overdue && "bg-red-500/10 text-red-600")}>
              <Calendar size={10} />
              {new Date(task.dueAt).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              {overdue && " ·прострочено"}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2 py-0.5", PRIORITY_COLOR[task.priority])}>
            <Flag size={10} /> {PRIORITY_LABEL[task.priority]}
          </span>
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">
              #{tag}
            </span>
          ))}
          {task.link && (
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-600">
              {task.link.kind}: {task.link.label || task.link.id}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onArchive} aria-label="Архівувати" className="rounded-md p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
          <Archive size={14} />
        </button>
        <button onClick={onRemove} aria-label="Видалити" className="rounded-md p-1.5 text-destructive/70 hover:bg-destructive/10">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
