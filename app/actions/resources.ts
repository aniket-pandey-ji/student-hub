"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { resources } from "@/lib/db/schema"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

function normalizeUrl(raw: string) {
  const url = raw.trim()
  if (!url) return ""
  if (/^https?:\/\//i.test(url)) return url
  return `https://${url}`
}

export async function getResources() {
  const userId = await getUserId()
  return db
    .select()
    .from(resources)
    .where(eq(resources.userId, userId))
    .orderBy(desc(resources.createdAt))
}

export async function createResource(formData: FormData) {
  const userId = await getUserId()
  const title = String(formData.get("title") ?? "").trim()
  const url = normalizeUrl(String(formData.get("url") ?? ""))
  if (!title) throw new Error("Title is required")
  if (!url) throw new Error("URL is required")
  const subjectIdRaw = String(formData.get("subjectId") ?? "")

  await db.insert(resources).values({
    userId,
    title,
    url,
    description: String(formData.get("description") ?? ""),
    type: String(formData.get("type") ?? "link"),
    subjectId: subjectIdRaw ? Number(subjectIdRaw) : null,
  })
  revalidatePath("/knowledge")
  revalidatePath("/dashboard")
}

export async function deleteResource(id: number) {
  const userId = await getUserId()
  await db
    .delete(resources)
    .where(and(eq(resources.id, id), eq(resources.userId, userId)))
  revalidatePath("/knowledge")
  revalidatePath("/dashboard")
}
