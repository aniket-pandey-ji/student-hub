"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/actions/auth"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  StickyNote,
  Users,
  CalendarCheck,
  BarChart3,
  Library,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subjects", label: "Subjects", icon: BookOpen },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/knowledge", label: "Knowledge Hub", icon: Library },
  { href: "/projects", label: "Projects", icon: Users },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/scores", label: "Scores", icon: BarChart3 },
]

export function AppSidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-semibold">Student Hub</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      <aside
        className={cn(
          "fixed inset-x-0 top-[57px] z-40 flex-col border-b border-border bg-card px-3 py-4 md:static md:top-0 md:flex md:h-svh md:w-64 md:border-b-0 md:border-r",
          open ? "flex" : "hidden",
        )}
      >
        <Link href="/dashboard" className="mb-6 hidden items-center gap-2 px-3 md:flex">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Student Hub</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              {initials || "S"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
