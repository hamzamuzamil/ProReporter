import { createServerClient } from "@/lib/supabase/server"
import { SharedReport } from "@/components/shared/shared-report"
import { notFound } from "next/navigation"

export default async function SharedReportPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  // Fetch the shared report
  const { data: sharedReport, error } = await supabase
    .from("shared_reports")
    .select(`
      id,
      report_id,
      shared_by,
      reports (
        id,
        title,
        description,
        data,
        insights,
        created_at,
        user_id
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !sharedReport || !sharedReport.reports) {
    notFound()
  }

  return <SharedReport report={sharedReport.reports} />
}
