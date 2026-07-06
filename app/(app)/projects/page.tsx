import { PageHeader } from "@/components/page-header"
import { db } from "@/lib/db"
import { projectTasks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getProjects } from "@/app/actions/projects"
import { ProjectsClient } from "./projects-client"

export default async function ProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [projects, tasks] = await Promise.all([
    getProjects(),
    db.select().from(projectTasks).where(eq(projectTasks.userId, session.user.id)),
  ])

  return (
    <>
      <PageHeader title="Projects" description="Group projects, tasks, and deadlines." />
      <ProjectsClient projects={projects} tasks={tasks} />
    </>
  )
}
