"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { subjects } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getSubjects() {
  const userId = await getUserId()
  return db.select().from(subjects).where(eq(subjects.userId, userId)).orderBy(asc(subjects.name))
}

export async function createSubject(formData: FormData) {
  const userId = await getUserId()
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("Subject name is required")

  await db.insert(subjects).values({
    userId,
    name,
    code: String(formData.get("code") ?? "").trim() || null,
    instructor: String(formData.get("instructor") ?? "").trim() || null,
    credits: Number(formData.get("credits") ?? 3) || 3,
    color: String(formData.get("color") ?? "emerald"),
  })
  revalidatePath("/subjects")
  revalidatePath("/dashboard")
}

export async function deleteSubject(id: number) {
  const userId = await getUserId()
  await db.delete(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, userId)))
  revalidatePath("/subjects")
  revalidatePath("/dashboard")
}
