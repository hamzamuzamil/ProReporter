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
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Users, Plus, UserPlus } from "lucide-react"

export function TeamsList({ teams }: { teams: any[] }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          description: teamDescription,
          created_by: user?.id,
        })
        .select()

      if (teamError) throw teamError

      // Add the creator as the owner
      const { error: memberError } = await supabase.from("team_members").insert({
        team_id: teamData[0].id,
        user_id: user?.id,
        role: "owner",
      })

      if (memberError) throw memberError

      // Reset form and close dialog
      setTeamName("")
      setTeamDescription("")
      setIsCreatingTeam(false)

      // Refresh the page to update the list
      router.refresh()
    } catch (error: any) {
      console.error("Error creating team:", error)
      setError(error.message || "Failed to create team")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Teams</h2>
        <Button
          onClick={() => setIsCreatingTeam(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-16 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-medium mb-2">No teams yet</h3>
            <p className="mb-4">Create a team to collaborate with others</p>
            <Button
              onClick={() => setIsCreatingTeam(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Create Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription className="line-clamp-2">{team.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-400">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Your role: <span className="ml-1 font-medium capitalize">{team.role}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 hover:bg-gray-800"
                  onClick={() => handleViewTeam(team.id)}
                >
                  View Team
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate with others on reports and dashboards.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTeam}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  rows={3}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingTeam(false)}
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
                {isSubmitting ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
