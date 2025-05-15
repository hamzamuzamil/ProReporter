import { ProtectedRoute } from "@/components/auth/protected-route"
import { AnalysisContent } from "@/components/analysis/analysis-content"

export default function AnalysisPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <AnalysisContent reportId={params.id} />
    </ProtectedRoute>
  )
}
