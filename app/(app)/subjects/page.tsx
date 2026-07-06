import { PageHeader } from "@/components/page-header"
import { getSubjects } from "@/app/actions/subjects"
import { SubjectsClient } from "./subjects-client"

export default async function SubjectsPage() {
  const subjects = await getSubjects()
  return (
    <>
      <PageHeader title="Subjects" description="All the courses you're taking this term." />
      <SubjectsClient subjects={subjects} />
    </>
  )
}
