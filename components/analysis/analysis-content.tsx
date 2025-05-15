"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, ArrowLeft, Save } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { ChatHistory } from "./chat-history"
import { InsightPanel } from "./insight-panel"
import { ExportPanel } from "./export-panel"
import { generateAnalysis } from "@/lib/openai"

export function AnalysisContent({ reportId }: { reportId: string }) {
  const { user } = useAuth()
  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])
  const [insights, setInsights] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true)
      try {
        // Fetch the report
        const { data, error } = await supabase.from("reports").select("*").eq("id", reportId).single()

        if (error) throw error

        setReport(data)

        // If insights already exist, use them
        if (data.insights) {
          setInsights(data.insights)
        } else {
          // Otherwise, generate initial analysis
          handleInitialAnalysis(data.data)
        }

        // Set initial chat history if available
        if (data.insights?.chatHistory) {
          setChatHistory(data.insights.chatHistory)
        }
      } catch (error) {
        console.error("Error fetching report:", error)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      fetchReport()
    }
  }, [reportId, router])

  const handleInitialAnalysis = async (data: any[]) => {
    setAnalyzing(true)
    try {
      const initialPrompt =
        "Analyze this data. Generate a 3-sentence summary, key trends, and 3 chart recommendations with configuration details."

      // Add the user message to chat history
      const newChatHistory = [{ role: "user", content: initialPrompt }]
      setChatHistory(newChatHistory)

      // Generate the analysis
      const response = await generateAnalysis(data, initialPrompt)

      // Add the AI response to chat history
      const updatedChatHistory = [...newChatHistory, { role: "assistant", content: response.text }]
      setChatHistory(updatedChatHistory)

      // Set the insights
      const newInsights = {
        ...response.insights,
        chatHistory: updatedChatHistory,
      }
      setInsights(newInsights)

      // Save the insights to the database
      await supabase.from("reports").update({ insights: newInsights }).eq("id", reportId).eq("user_id", user?.id)
    } catch (err) {
      console.error("Error generating initial analysis:", err)
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't analyze your data. Please try again or upload a different file.",
        },
      ])
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userQuery.trim() || !report?.data) return

    // Add the user message to chat history
    const newChatHistory = [...chatHistory, { role: "user", content: userQuery }]
    setChatHistory(newChatHistory)

    setAnalyzing(true)
    try {
      // Generate the analysis based on the user query
      const response = await generateAnalysis(report.data, userQuery)

      // Add the AI response to chat history
      const updatedChatHistory = [...newChatHistory, { role: "assistant", content: response.text }]
      setChatHistory(updatedChatHistory)

      // Update the insights
      let updatedInsights = { ...insights }

      // If there are new charts, add them
      if (response.insights && response.insights.charts) {
        updatedInsights = {
          ...updatedInsights,
          charts: [...(updatedInsights?.charts || []), ...(response.insights.charts || [])],
          chatHistory: updatedChatHistory,
        }
      } else {
        updatedInsights = {
          ...updatedInsights,
          chatHistory: updatedChatHistory,
        }
      }

      setInsights(updatedInsights)

      // Save the updated insights to the database
      await supabase.from("reports").update({ insights: updatedInsights }).eq("id", reportId).eq("user_id", user?.id)
    } catch (err) {
      console.error("Error generating analysis:", err)
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't process your query. Please try again with a different question.",
        },
      ])
    } finally {
      setAnalyzing(false)
      setUserQuery("")
    }
  }

  const handleSaveInsights = async () => {
    if (!insights) return

    try {
      await supabase.from("reports").update({ insights }).eq("id", reportId).eq("user_id", user?.id)
    } catch (error) {
      console.error("Error saving insights:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Report not found</h2>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold ml-4">{report.title}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 hover:border-gray-600"
            onClick={handleSaveInsights}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Chat with Your Data</CardTitle>
                <CardDescription className="text-gray-400">
                  Ask questions about your data to get insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatHistory messages={chatHistory} loading={analyzing} />

                <form onSubmit={handleSubmitQuery} className="mt-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask a question about your data..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="min-h-[60px] bg-gray-800 border-gray-700"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={analyzing || !userQuery.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    <SampleQuery query="What are the key trends in this data?" onClick={setUserQuery} />
                    <SampleQuery query="Generate a bar chart of the top 5 items" onClick={setUserQuery} />
                    <SampleQuery query="What's the average value over time?" onClick={setUserQuery} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <InsightPanel insights={insights} loading={analyzing} />
          </TabsContent>

          <TabsContent value="export">
            <ExportPanel reportId={reportId} insights={insights} chatHistory={chatHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SampleQuery({ query, onClick }: { query: string; onClick: (query: string) => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-sm border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
      onClick={() => onClick(query)}
    >
      {query}
    </Button>
  )
}
