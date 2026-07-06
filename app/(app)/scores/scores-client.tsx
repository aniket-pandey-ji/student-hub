"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
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
import { recordScore, deleteScore } from "@/app/actions/scores"
import { Plus, Trash2, Loader2, BarChart3 } from "lucide-react"

type Subject = { id: number; name: string }
type Score = {
  id: number
  subjectId: number
  title: string
  score: number
  maxScore: number
  weight: number
  date: Date
}

export function ScoresClient({ scores, subjects }: { scores: Score[]; subjects: Subject[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? "Unknown"

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await recordScore(formData)
      setOpen(false)
    })
  }

  // weighted average per subject
  const summary = subjects
    .map((s) => {
      const items = scores.filter((sc) => sc.subjectId === s.id)
      const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
      const weighted = items.reduce((sum, i) => sum + (i.score / i.maxScore) * 100 * i.weight, 0)
      const avg = totalWeight === 0 ? null : Math.round(weighted / totalWeight)
      return { ...s, count: items.length, avg }
    })
    .filter((s) => s.count > 0)

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={subjects.length === 0}>
              <Plus className="size-4" /> Add score
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a score</DialogTitle>
              <DialogDescription>Record an assessment result.</DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="subjectId">Subject</Label>
                <Select id="subjectId" name="subjectId" required defaultValue="">
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Assessment</Label>
                <Input id="title" name="title" placeholder="Midterm exam" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="score">Score</Label>
                  <Input id="score" name="score" type="number" min={0} defaultValue={0} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="maxScore">Out of</Label>
                  <Input id="maxScore" name="maxScore" type="number" min={1} defaultValue={100} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input id="weight" name="weight" type="number" min={1} defaultValue={1} />
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
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <EmptyState message="Add a subject first, then record your scores." />
      ) : (
        <>
          {summary.length > 0 && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summary.map((s) => (
                <div key={s.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-lg font-semibold text-primary">{s.avg}%</p>
                  </div>
                  <Progress value={s.avg ?? 0} />
                  <p className="text-xs text-muted-foreground">{s.count} assessments</p>
                </div>
              ))}
            </div>
          )}

          {scores.length === 0 ? (
            <EmptyState message="No scores recorded yet." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-label font-medium">Assessment</th>
                    <th className="px-4 py-3 font-label font-medium">Subject</th>
                    <th className="px-4 py-3 font-label font-medium">Score</th>
                    <th className="px-4 py-3 font-label font-medium">%</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {scores.map((sc) => {
                    const pct = Math.round((sc.score / sc.maxScore) * 100)
                    return (
                      <tr key={sc.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{sc.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{subjectName(sc.subjectId)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sc.score}/{sc.maxScore}
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary">{pct}%</td>
                        <td className="px-4 py-3 text-right">
                          <DeleteButton id={sc.id} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}

function DeleteButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => deleteScore(id))}
      disabled={isPending}
      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      aria-label="Delete score"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <BarChart3 className="size-6" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
