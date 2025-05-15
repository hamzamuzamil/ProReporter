"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { FileText, MoreVertical, Share2, Trash2, Calendar, BarChart3, Loader2 } from "lucide-react"

export function ReportsList({ reports }: { reports: any[] }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState<string | null>(null)
  const [shareEmail, setShareEmail] = useState("")
  const [shareError, setShareError] = useState<string | null>(null)
  const [shareSuccess, setShareSuccess] = useState<string | null>(null)

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/${reportId}`)
  }

  const handleDeleteReport = async (reportId: string) => {
    setIsDeleting(reportId)
    try {
      const { error } = await supabase.from("reports").delete().eq("id", reportId).eq("user_id", user?.id)

      if (error) throw error

      // Refresh the page to update the list
      router.refresh()
    } catch (error) {
      console.error("Error deleting report:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleShareReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSharing || !shareEmail) return

    setShareError(null)
    setShareSuccess(null)

    try {
      // First, check if the user exists
      const { data: userData, error: userError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", shareEmail)
        .single()

      if (userError || !userData) {
        setShareError("User not found. Please check the email address.")
        return
      }

      // Share the report
      const { error } = await supabase.from("shared_reports").insert({
        report_id: isSharing,
        shared_by: user?.id,
        shared_with: userData.id,
      })

      if (error) {
        if (error.code === "23505") {
          // Unique violation
          setShareError("This report is already shared with this user.")
        } else {
          throw error
        }
      } else {
        setShareSuccess("Report shared successfully!")
        setShareEmail("")
      }
    } catch (error) {
      console.error("Error sharing report:", error)
      setShareError("Failed to share report. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (reports.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-16 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">No reports yet</h3>
          <p className="mb-4">Upload a CSV file to create your first report</p>
          <Button
            onClick={() => router.push("/upload")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            New Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((report) => (
        <Card key={report.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{report.title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800">
                  <DropdownMenuItem onClick={() => handleViewReport(report.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSharing(report.id)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    {isDeleting === report.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="line-clamp-2">{report.description || "No description"}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(report.created_at)}
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <BarChart3 className="mr-2 h-4 w-4" />
              {report.insights?.charts?.length || 0} charts
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-gray-700 hover:bg-gray-800"
              onClick={() => handleViewReport(report.id)}
            >
              View Report
            </Button>
          </CardFooter>
        </Card>
      ))}

      {/* Share Dialog */}
      <Dialog
        open={!!isSharing}
        onOpenChange={(open) => {
          if (!open) {
            setIsSharing(null)
            setShareEmail("")
            setShareError(null)
            setShareSuccess(null)
          }
        }}
      >
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Enter the email address of the user you want to share this report with.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleShareReport}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              {shareError && <p className="text-sm text-red-500">{shareError}</p>}
              {shareSuccess && <p className="text-sm text-green-500">{shareSuccess}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSharing(null)} className="border-gray-700">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Share
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
