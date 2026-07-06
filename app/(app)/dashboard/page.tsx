import Link from "next/link"
import { headers } from "next/headers"
import { BookOpen, CalendarCheck, FolderKanban, GraduationCap, StickyNote, TrendingUp } from "lucide-react"
import { auth } from "@/lib/auth"
import { getSubjects } from "@/app/actions/subjects"
import { getNotes } from "@/app/actions/notes"
import { getProjects } from "@/app/actions/projects"
import { getAttendance } from "@/app/actions/attendance"
import { getScores } from "@/app/actions/scores"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

function formatDate(date: Date | null) {
  if (!date) return "No due date"
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  const [subjects, notes, projects, attendance, scores] = await Promise.all([
    getSubjects(),
    getNotes(),
    getProjects(),
    getAttendance(),
    getScores(),
  ])

  const presentCount = attendance.filter((a) => a.status === "present").length
  const attendanceRate =
    attendance.length === 0 ? 0 : Math.round((presentCount / attendance.length) * 100)

  const gradeAverage =
    scores.length === 0
      ? 0
      : Math.round(
          (scores.reduce((sum, s) => sum + s.score / s.maxScore, 0) / scores.length) * 100,
        )

  const activeProjects = projects.filter((p) => p.status !== "completed")
  const upcomingProjects = [...projects]
    .filter((p) => p.dueDate && p.status !== "completed")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4)

  const recentScores = scores.slice(0, 4)

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your academic progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Subjects" value={subjects.length} hint="Enrolled courses" icon={BookOpen} />
        <StatCard
          label="Grade Avg"
          value={`${gradeAverage}%`}
          hint={`${scores.length} recorded`}
          icon={GraduationCap}
        />
        <StatCard
          label="Attendance"
          value={`${attendanceRate}%`}
          hint={`${presentCount}/${attendance.length} present`}
          icon={CalendarCheck}
        />
        <StatCard
          label="Active Projects"
          value={activeProjects.length}
          hint={`${projects.length} total`}
          icon={FolderKanban}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Upcoming deadlines</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingProjects.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming deadlines. Create a project to get started.
              </p>
            ) : (
              upcomingProjects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FolderKanban className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{p.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={p.progress} className="h-1.5" />
                      <span className="font-mono text-xs text-muted-foreground">{p.progress}%</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {formatDate(p.dueDate)}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent scores</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {recentScores.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No scores recorded yet.</p>
            ) : (
              recentScores.map((s) => {
                const pct = Math.round((s.score / s.maxScore) * 100)
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{s.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {s.score}/{s.maxScore}
                      </p>
                    </div>
                    <Badge variant={pct >= 70 ? "default" : pct >= 50 ? "secondary" : "destructive"}>
                      {pct}%
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Your subjects</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/subjects">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No subjects yet. Add your courses to get organized.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Badge key={s.id} variant="outline" className="gap-1.5">
                    <BookOpen className="size-3" />
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent notes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/notes">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {notes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              notes.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-center gap-3">
                  <StickyNote className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">{n.title}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
