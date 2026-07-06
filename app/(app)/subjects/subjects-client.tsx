"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { createSubject, deleteSubject } from "@/app/actions/subjects"
import { Plus, Trash2, User, Hash, Loader2, BookOpen } from "lucide-react"

type Subject = {
  id: number
  name: string
  code: string | null
  instructor: string | null
  credits: number | null
  color: string | null
}

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
}

export function SubjectsClient({ subjects }: { subjects: Subject[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createSubject(formData)
      setOpen(false)
    })
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" /> Add subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a subject</DialogTitle>
              <DialogDescription>Add a course you&apos;re taking this term.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Data Structures" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" name="code" placeholder="CS 201" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input id="credits" name="credits" type="number" min={0} max={12} defaultValue={3} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input id="instructor" name="instructor" placeholder="Dr. Smith" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="color">Color</Label>
                <Select id="color" name="color" defaultValue="emerald">
                  <option value="emerald">Emerald</option>
                  <option value="blue">Blue</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                  <option value="violet">Violet</option>
                </Select>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Add subject
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`size-3 rounded-full ${colorMap[s.color ?? "emerald"] ?? "bg-emerald-500"}`} />
                  <div>
                    <h3 className="font-semibold leading-tight">{s.name}</h3>
                    {s.code && <p className="text-xs text-muted-foreground">{s.code}</p>}
                  </div>
                </div>
                <DeleteButton id={s.id} />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {s.instructor && (
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3.5" /> {s.instructor}
                  </span>
                )}
                <Badge variant="muted" className="gap-1">
                  <Hash className="size-3" /> {s.credits} credits
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => deleteSubject(id))}
      disabled={isPending}
      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      aria-label="Delete subject"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BookOpen className="size-6" />
      </div>
      <div>
        <p className="font-medium">No subjects yet</p>
        <p className="text-sm text-muted-foreground">Add your first course to get started.</p>
      </div>
    </div>
  )
}
