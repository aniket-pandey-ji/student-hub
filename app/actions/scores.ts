"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { scores } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getScores() {
  const userId = await getUserId()
  return db.select().from(scores).where(eq(scores.userId, userId)).orderBy(desc(scores.date))
}

export async function recordScore(formData: FormData) {
  const userId = await getUserId()
  const subjectId = Number(formData.get("subjectId"))
  if (!subjectId) throw new Error("Subject is required")
  const title = String(formData.get("title") ?? "").trim()
  if (!title) throw new Error("Title is required")

  await db.insert(scores).values({
    userId,
    subjectId,
    title,
    score: Number(formData.get("score") ?? 0) || 0,
    maxScore: Number(formData.get("maxScore") ?? 100) || 100,
    weight: Number(formData.get("weight") ?? 1) || 1,
  })
  revalidatePath("/scores")
  revalidatePath("/dashboard")
}

export async function deleteScore(id: number) {
  const userId = await getUserId()
  await db.delete(scores).where(and(eq(scores.id, id), eq(scores.userId, userId)))
  revalidatePath("/scores")
  revalidatePath("/dashboard")
}
