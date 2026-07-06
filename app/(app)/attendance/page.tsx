import { PageHeader } from "@/components/page-header"
import { getAttendance } from "@/app/actions/attendance"
import { getSubjects } from "@/app/actions/subjects"
import { AttendanceClient } from "./attendance-client"

export default async function AttendancePage() {
  const [records, subjects] = await Promise.all([getAttendance(), getSubjects()])
  return (
    <>
      <PageHeader title="Attendance" description="Track which classes you attended." />
      <AttendanceClient records={records} subjects={subjects.map((s) => ({ id: s.id, name: s.name }))} />
    </>
  )
}
