import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  BookOpen,
  StickyNote,
  Users,
  CalendarCheck,
  BarChart3,
  ArrowRight,
} from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Subjects",
    desc: "Track every course with credits, instructors, and color-coded organization.",
  },
  {
    icon: StickyNote,
    title: "Notes",
    desc: "Capture lecture notes, pin the important ones, and link them to subjects.",
  },
  {
    icon: Users,
    title: "Group projects",
    desc: "Coordinate teams, break work into tasks, and watch progress climb.",
  },
  {
    icon: CalendarCheck,
    title: "Attendance",
    desc: "Log every class as present, late, or absent and keep your streak visible.",
  },
  {
    icon: BarChart3,
    title: "Scores",
    desc: "Record assessments and see weighted averages per subject automatically.",
  },
  {
    icon: GraduationCap,
    title: "Dashboard",
    desc: "One overview of your workload, upcoming deadlines, and academic health.",
  },
]

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Student Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
          <div className="flex flex-col gap-6">
            <Badge variant="success" className="w-fit font-label">
              Built for students
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
              Your entire academic life, in one focused workspace.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
              Student Hub brings your subjects, notes, group projects, attendance, and exam scores
              together so you always know where you stand.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Start for free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">I have an account</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
            <Image
              src="/hero-study.png"
              alt="A tidy student study desk with laptop, notebook, and coffee"
              width={720}
              height={560}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20">
          <div className="mb-10 flex flex-col gap-2 text-center">
            <span className="font-label text-xs text-primary">Everything you need</span>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Six tools that work together
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>Student Hub</span>
          <span>Organize smarter. Study better.</span>
        </div>
      </footer>
    </div>
  )
}
