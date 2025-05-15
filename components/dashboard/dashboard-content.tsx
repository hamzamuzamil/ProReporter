"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Loader2, Plus, FileText, Users, LayoutDashboard } from "lucide-react"
import { DashboardHeader } from "./dashboard-header"
import { ReportsList } from "./reports-list"
import { TeamsList } from "./teams-list"
import { TemplatesList } from "./templates-list"

export function DashboardContent() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch user's reports
        const { data: reportsData, error: reportsError } = await supabase
          .from("reports")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })

        if (reportsError) throw reportsError
        setReports(reportsData || [])

        // Fetch user's teams
        const { data: teamMemberships, error: teamsError } = await supabase
          .from("team_members")
          .select("team_id, role, teams(*)")
          .eq("user_id", user?.id)

        if (teamsError) throw teamsError
        setTeams(teamMemberships.map((tm) => ({ ...tm.teams, role: tm.role })) || [])

        // Fetch user's templates
        const { data: templatesData, error: templatesError } = await supabase
          .from("dashboard_templates")
          .select("*")
          .eq("user_id", user?.id)

        if (templatesError) throw templatesError
        setTemplates(templatesData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleNewAnalysis = () => {
    router.push("/upload")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button
            onClick={handleNewAnalysis}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <ReportsList reports={reports} />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsList teams={teams} />
          </TabsContent>

          <TabsContent value="templates">
            <TemplatesList templates={templates} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
