"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
import { recordAttendance, deleteAttendance } from "@/app/actions/attendance"
import { Plus, Trash2, Loader2, CalendarCheck } from "lucide-react"

type Subject = { id: number; name: string }
type Record = { id: number; subjectId: number; status: string; date: Date }

const statusVariant: Record<string, "success" | "warning" | "muted"> = {
  present: "success",
  late: "warning",
  absent: "muted",
}

export function AttendanceClient({ records, subjects }: { records: Record[]; subjects: Subject[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? "Unknown"

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await recordAttendance(formData)
      setOpen(false)
    })
  }

  // per-subject rate summary
  const summary = subjects.map((s) => {
    const recs = records.filter((r) => r.subjectId === s.id)
    const attended = recs.filter((r) => r.status !== "absent").length
    const rate = recs.length === 0 ? null : Math.round((attended / recs.length) * 100)
    return { ...s, total: recs.length, rate }
  })

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={subjects.length === 0}>
              <Plus className="size-4" /> Log attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log attendance</DialogTitle>
              <DialogDescription>Record a class you attended or missed.</DialogDescription>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" name="status" defaultValue="present">
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
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
        <EmptyState message="Add a subject first, then start logging attendance." />
      ) : (
        <>
          {summary.some((s) => s.total > 0) && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summary
                .filter((s) => s.total > 0)
                .map((s) => (
                  <div key={s.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">{s.rate}%</p>
                    <p className="text-xs text-muted-foreground">{s.total} classes logged</p>
                  </div>
                ))}
            </div>
          )}

          {records.length === 0 ? (
            <EmptyState message="No attendance logged yet." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-label font-medium">Date</th>
                    <th className="px-4 py-3 font-label font-medium">Subject</th>
                    <th className="px-4 py-3 font-label font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium">{subjectName(r.subjectId)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[r.status] ?? "muted"} className="capitalize">
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteButton id={r.id} />
                      </td>
                    </tr>
                  ))}
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
      onClick={() => startTransition(() => deleteAttendance(id))}
      disabled={isPending}
      className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
      aria-label="Delete record"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarCheck className="size-6" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
