"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  createProject,
  deleteProject,
  addProjectTask,
  toggleProjectTask,
  deleteProjectTask,
} from "@/app/actions/projects"
import {
  Plus,
  Trash2,
  Loader2,
  Users,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Check,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Task = { id: number; projectId: number; title: string; done: boolean }
type Project = {
  id: number
  title: string
  description: string | null
  status: string
  progress: number
  members: string | null
  dueDate: Date | null
}

const statusVariant: Record<string, "muted" | "warning" | "success"> = {
  planning: "muted",
  "in-progress": "warning",
  completed: "success",
}

export function ProjectsClient({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createProject(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>Create a group project and track its progress.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Database design project" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} placeholder="What's this project about?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="members">Members</Label>
                  <Input id="members" name="members" placeholder="Ada, Alan, Grace" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueDate">Due date</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Create project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} tasks={tasks.filter((t) => t.projectId === p.id)} />
          ))}
        </div>
      )}
    </>
  )
}

function ProjectCard({ project, tasks }: { project: Project; tasks: Task[] }) {
  const [expanded, setExpanded] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [isPending, startTransition] = useTransition()

  const members = (project.members ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)

  const due = project.dueDate ? new Date(project.dueDate) : null

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-tight">{project.title}</h3>
            <Badge variant={statusVariant[project.status] ?? "muted"} className="capitalize">
              {project.status.replace("-", " ")}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          )}
        </div>
        <button
          onClick={() => startTransition(() => deleteProject(project.id))}
          disabled={isPending}
          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          aria-label="Delete project"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-label">Progress</span>
          <span>{project.progress}%</span>
        </div>
        <Progress value={project.progress} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {members.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" /> {members.join(", ")}
          </span>
        )}
        {due && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4" />
            {due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>

      <button
        onClick={() => setExpanded((e) => !e)}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-primary"
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        Tasks ({tasks.filter((t) => t.done).length}/{tasks.length})
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
          <form
            action={(fd) => {
              const title = String(fd.get("title") ?? "")
              startTransition(async () => {
                await addProjectTask(project.id, title)
                setNewTask("")
              })
            }}
            className="mt-1 flex items-center gap-2"
          >
            <Input
              name="title"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a task..."
              className="h-9"
            />
            <Button type="submit" size="sm" variant="outline" disabled={!newTask.trim()}>
              Add
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

function TaskRow({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition()
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => startTransition(() => toggleProjectTask(task.id, task.projectId, !task.done))}
        disabled={isPending}
        className={cn(
          "flex size-5 items-center justify-center rounded-full border transition-colors",
          task.done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
        )}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
      >
        {task.done ? <Check className="size-3" /> : <Circle className="size-3 opacity-0" />}
      </button>
      <span className={cn("flex-1 text-sm", task.done && "text-muted-foreground line-through")}>{task.title}</span>
      <button
        onClick={() => startTransition(() => deleteProjectTask(task.id, task.projectId))}
        disabled={isPending}
        className="text-muted-foreground transition-colors hover:text-destructive"
        aria-label="Delete task"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Users className="size-6" />
      </div>
      <div>
        <p className="font-medium">No projects yet</p>
        <p className="text-sm text-muted-foreground">Start a group project and break it into tasks.</p>
      </div>
    </div>
  )
}
