"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { createResource, deleteResource } from "@/app/actions/resources"
import {
  Plus,
  Trash2,
  Loader2,
  Library,
  ExternalLink,
  FileText,
  Video,
  BookOpen,
  Link as LinkIcon,
} from "lucide-react"

type Resource = {
  id: number
  title: string
  url: string
  description: string | null
  type: string
  subjectId: number | null
  createdAt: Date
}

type Subject = { id: number; name: string }

const TYPES = [
  { value: "link", label: "Link", icon: LinkIcon },
  { value: "article", label: "Article", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "book", label: "Book / PDF", icon: BookOpen },
] as const

function typeMeta(type: string) {
  return TYPES.find((t) => t.value === type) ?? TYPES[0]
}

export function KnowledgeClient({
  resources,
  subjects,
}: {
  resources: Resource[]
  subjects: Subject[]
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [isPending, startTransition] = useTransition()

  const subjectName = (id: number | null) => subjects.find((s) => s.id === id)?.name

  const filtered = useMemo(
    () => (filter === "all" ? resources : resources.filter((r) => r.type === filter)),
    [resources, filter],
  )

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createResource(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {TYPES.map((t) => (
            <FilterChip
              key={t.value}
              label={t.label}
              active={filter === t.value}
              onClick={() => setFilter(t.value)}
            />
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> Add resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add resource</DialogTitle>
              <DialogDescription>Save a helpful link, article, video, or reading.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="MDN: Array methods" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" placeholder="developer.mozilla.org/..." required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select id="type" name="type" defaultValue="link">
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="subjectId">Subject</Label>
                  <Select id="subjectId" name="subjectId" defaultValue="">
                    <option value="">No subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Why is this resource useful?"
                />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Save resource
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <EmptyState hasAny={resources.length > 0} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const meta = typeMeta(r.type)
            const Icon = meta.icon
            return (
              <article
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4.5" />
                  </div>
                  <DeleteButton id={r.id} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold leading-tight text-balance">{r.title}</h3>
                  {r.description && (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{meta.label}</Badge>
                  {subjectName(r.subjectId) && <Badge variant="outline">{subjectName(r.subjectId)}</Badge>}
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Open resource <ExternalLink className="size-3.5" />
                </a>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          : "rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {label}
    </button>
  )
}

function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => deleteResource(id))}
      disabled={isPending}
      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      aria-label="Delete resource"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  )
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Library className="size-6" />
      </div>
      <div>
        <p className="font-medium">{hasAny ? "No resources of this type" : "No resources yet"}</p>
        <p className="text-sm text-muted-foreground">
          {hasAny
            ? "Try a different filter or add a new resource."
            : "Save your first study link, article, or video."}
        </p>
      </div>
    </div>
  )
}
