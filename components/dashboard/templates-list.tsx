"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { LayoutDashboard, Plus, Calendar } from "lucide-react"

export function TemplatesList({ templates }: { templates: any[] }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create a default empty layout
      const defaultLayout = {
        rows: [
          {
            id: "row-1",
            columns: [{ id: "col-1", width: 12, widgets: [] }],
          },
        ],
      }

      // Create the template
      const { error: templateError } = await supabase.from("dashboard_templates").insert({
        name: templateName,
        description: templateDescription,
        user_id: user?.id,
        layout: defaultLayout,
        is_public: isPublic,
      })

      if (templateError) throw templateError

      // Reset form and close dialog
      setTemplateName("")
      setTemplateDescription("")
      setIsPublic(false)
      setIsCreatingTemplate(false)

      // Refresh the page to update the list
      router.refresh()
    } catch (error: any) {
      console.error("Error creating template:", error)
      setError(error.message || "Failed to create template")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTemplate = (templateId: string) => {
    router.push(`/templates/${templateId}/edit`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Dashboard Templates</h2>
        <Button
          onClick={() => setIsCreatingTemplate(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-16 text-center text-gray-500">
            <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-medium mb-2">No templates yet</h3>
            <p className="mb-4">Create a template to save your dashboard layouts</p>
            <Button
              onClick={() => setIsCreatingTemplate(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created {formatDate(template.created_at)}
                </div>
                <div className="text-sm text-gray-400">
                  {template.is_public ? (
                    <span className="text-green-500">Public template</span>
                  ) : (
                    <span>Private template</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 hover:bg-gray-800"
                  onClick={() => handleEditTemplate(template.id)}
                >
                  Edit Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Create Dashboard Template</DialogTitle>
            <DialogDescription>
              Create a new dashboard template to save your preferred layout and visualizations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public">Make template public</Label>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingTemplate(false)}
                className="border-gray-700"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
