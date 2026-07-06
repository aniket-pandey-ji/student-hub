"use client"

import { useState, useTransition } from "react"
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
import { createNote, togglePinNote, deleteNote } from "@/app/actions/notes"
import { Plus, Trash2, Pin, PinOff, Loader2, StickyNote } from "lucide-react"

type Note = {
  id: number
  title: string
  content: string | null
  pinned: boolean
  subjectId: number | null
  updatedAt: Date
}

type Subject = { id: number; name: string }

export function NotesClient({ notes, subjects }: { notes: Note[]; subjects: Subject[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const subjectName = (id: number | null) => subjects.find((s) => s.id === id)?.name

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createNote(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> New note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New note</DialogTitle>
              <DialogDescription>Jot down what you learned.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Big-O notation summary" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="subjectId">Subject (optional)</Label>
                <Select id="subjectId" name="subjectId" defaultValue="">
                  <option value="">No subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" rows={5} placeholder="Write your notes here..." />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Save note
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((n) => (
            <article
              key={n.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight text-balance">{n.title}</h3>
                <div className="flex shrink-0 items-center gap-1">
                  <PinButton id={n.id} pinned={n.pinned} />
                  <DeleteButton id={n.id} />
                </div>
              </div>
              {n.content && (
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {n.content}
                </p>
              )}
              {subjectName(n.subjectId) && (
                <Badge variant="secondary" className="w-fit">
                  {subjectName(n.subjectId)}
                </Badge>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function PinButton({ id, pinned }: { id: number; pinned: boolean }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => togglePinNote(id, !pinned))}
      disabled={isPending}
      className={pinned ? "text-primary" : "text-muted-foreground hover:text-foreground"}
      aria-label={pinned ? "Unpin note" : "Pin note"}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : pinned ? (
        <Pin className="size-4 fill-current" />
      ) : (
        <PinOff className="size-4" />
      )}
    </button>
  )
}

function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => deleteNote(id))}
      disabled={isPending}
      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      aria-label="Delete note"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <StickyNote className="size-6" />
      </div>
      <div>
        <p className="font-medium">No notes yet</p>
        <p className="text-sm text-muted-foreground">Create your first note to capture what you learn.</p>
      </div>
    </div>
  )
}
