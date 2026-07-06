"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notes } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getNotes() {
  const userId = await getUserId()
  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt))
}

export async function createNote(formData: FormData) {
  const userId = await getUserId()
  const title = String(formData.get("title") ?? "").trim()
  if (!title) throw new Error("Title is required")
  const subjectIdRaw = String(formData.get("subjectId") ?? "")

  await db.insert(notes).values({
    userId,
    title,
    content: String(formData.get("content") ?? ""),
    subjectId: subjectIdRaw ? Number(subjectIdRaw) : null,
  })
  revalidatePath("/notes")
  revalidatePath("/dashboard")
}

export async function togglePinNote(id: number, pinned: boolean) {
  const userId = await getUserId()
  await db
    .update(notes)
    .set({ pinned, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
  revalidatePath("/notes")
}

export async function deleteNote(id: number) {
  const userId = await getUserId()
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
  revalidatePath("/notes")
  revalidatePath("/dashboard")
}
