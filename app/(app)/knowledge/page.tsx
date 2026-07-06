import { PageHeader } from "@/components/page-header"
import { getResources } from "@/app/actions/resources"
import { getSubjects } from "@/app/actions/subjects"
import { KnowledgeClient } from "./knowledge-client"

export default async function KnowledgePage() {
  const [resources, subjects] = await Promise.all([getResources(), getSubjects()])
  return (
    <>
      <PageHeader
        title="Knowledge Hub"
        description="Collect and organize study resources, links, and readings."
      />
      <KnowledgeClient
        resources={resources}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  )
}
