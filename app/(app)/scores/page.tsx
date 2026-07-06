import { PageHeader } from "@/components/page-header"
import { getSubjects } from "@/app/actions/subjects"
import { getScores } from "@/app/actions/scores"
import { ScoresClient } from "./scores-client"

export default async function ScoresPage() {
  const [subjects, scores] = await Promise.all([getSubjects(), getScores()])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scores"
        description="Track exam and assignment results and watch your grade trends."
      />
      <ScoresClient subjects={subjects} scores={scores} />
    </div>
  )
}
