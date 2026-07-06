"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { projects, projectTasks } from "@/lib/db/schema"
import { and, asc, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getProjects() {
  const userId = await getUserId()
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt))
}

export async function getProjectTasks(projectId: number) {
  const userId = await getUserId()
  return db
    .select()
    .from(projectTasks)
    .where(and(eq(projectTasks.userId, userId), eq(projectTasks.projectId, projectId)))
    .orderBy(asc(projectTasks.createdAt))
}

export async function createProject(formData: FormData) {
  const userId = await getUserId()
  const title = String(formData.get("title") ?? "").trim()
  if (!title) throw new Error("Title is required")
  const dueRaw = String(formData.get("dueDate") ?? "")

  await db.insert(projects).values({
    userId,
    title,
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "planning"),
    members: String(formData.get("members") ?? ""),
    dueDate: dueRaw ? new Date(dueRaw) : null,
  })
  revalidatePath("/projects")
  revalidatePath("/dashboard")
}

export async function updateProjectStatus(id: number, status: string, progress: number) {
  const userId = await getUserId()
  await db
    .update(projects)
    .set({ status, progress })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
  revalidatePath("/projects")
  revalidatePath("/dashboard")
}

export async function deleteProject(id: number) {
  const userId = await getUserId()
  await db.delete(projectTasks).where(and(eq(projectTasks.projectId, id), eq(projectTasks.userId, userId)))
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)))
  revalidatePath("/projects")
  revalidatePath("/dashboard")
}

export async function addProjectTask(projectId: number, title: string) {
  const userId = await getUserId()
  if (!title.trim()) return
  await db.insert(projectTasks).values({ userId, projectId, title: title.trim() })
  await recomputeProgress(userId, projectId)
  revalidatePath("/projects")
}

export async function toggleProjectTask(taskId: number, projectId: number, done: boolean) {
  const userId = await getUserId()
  await db
    .update(projectTasks)
    .set({ done })
    .where(and(eq(projectTasks.id, taskId), eq(projectTasks.userId, userId)))
  await recomputeProgress(userId, projectId)
  revalidatePath("/projects")
  revalidatePath("/dashboard")
}

export async function deleteProjectTask(taskId: number, projectId: number) {
  const userId = await getUserId()
  await db
    .delete(projectTasks)
    .where(and(eq(projectTasks.id, taskId), eq(projectTasks.userId, userId)))
  await recomputeProgress(userId, projectId)
  revalidatePath("/projects")
}

async function recomputeProgress(userId: string, projectId: number) {
  const tasks = await db
    .select()
    .from(projectTasks)
    .where(and(eq(projectTasks.userId, userId), eq(projectTasks.projectId, projectId)))
  const total = tasks.length
  const completed = tasks.filter((t) => t.done).length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)
  const status = progress === 100 ? "completed" : progress > 0 ? "in-progress" : "planning"
  await db
    .update(projects)
    .set({ progress, status })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
}
