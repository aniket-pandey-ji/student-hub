import { PageHeader } from "@/components/page-header"
import { getNotes } from "@/app/actions/notes"
import { getSubjects } from "@/app/actions/subjects"
import { NotesClient } from "./notes-client"

export default async function NotesPage() {
  const [notes, subjects] = await Promise.all([getNotes(), getSubjects()])
  return (
    <>
      <PageHeader title="Notes" description="Your lecture notes and study summaries." />
      <NotesClient notes={notes} subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
    </>
  )
}
