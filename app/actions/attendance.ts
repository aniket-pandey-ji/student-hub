"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { attendance } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getAttendance() {
  const userId = await getUserId()
  return db.select().from(attendance).where(eq(attendance.userId, userId)).orderBy(desc(attendance.date))
}

export async function recordAttendance(formData: FormData) {
  const userId = await getUserId()
  const subjectId = Number(formData.get("subjectId"))
  if (!subjectId) throw new Error("Subject is required")
  const dateRaw = String(formData.get("date") ?? "")

  await db.insert(attendance).values({
    userId,
    subjectId,
    status: String(formData.get("status") ?? "present"),
    date: dateRaw ? new Date(dateRaw) : new Date(),
  })
  revalidatePath("/attendance")
  revalidatePath("/dashboard")
}

export async function deleteAttendance(id: number) {
  const userId = await getUserId()
  await db.delete(attendance).where(and(eq(attendance.id, id), eq(attendance.userId, userId)))
  revalidatePath("/attendance")
  revalidatePath("/dashboard")
}
