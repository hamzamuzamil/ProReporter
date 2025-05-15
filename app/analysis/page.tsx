"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, ArrowLeft } from "lucide-react"
import { ChatHistory } from "@/components/chat-history"
import { InsightPanel } from "@/components/insight-panel"
import { ExportPanel } from "@/components/export-panel"
import { generateAnalysis } from "@/lib/openai"

export default function AnalysisPage() {
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [userQuery, setUserQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])
  const [insights, setInsights] = useState<any | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Retrieve the CSV data from session storage
    const storedData = sessionStorage.getItem("csvData")

    if (!storedData) {
      // Redirect back to the upload page if no data is found
      router.push("/")
      return
    }

    try {
      const parsedData = JSON.parse(storedData)
      setCsvData(parsedData)

      // Generate initial analysis
      handleInitialAnalysis(parsedData)
    } catch (err) {
      console.error("Error parsing stored data:", err)
      router.push("/")
    }
  }, [router])

  const handleInitialAnalysis = async (data: any[]) => {
    setLoading(true)
    try {
      const initialPrompt =
        "Analyze this data. Generate a 3-sentence summary, key trends, and 3 chart recommendations with configuration details."

      // Add the user message to chat history
      setChatHistory([{ role: "user", content: initialPrompt }])

      // Generate the analysis
      const response = await generateAnalysis(data, initialPrompt)

      // Add the AI response to chat history
      setChatHistory((prev) => [...prev, { role: "assistant", content: response.text }])

      // Set the insights
      setInsights(response.insights)
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
      setLoading(false)
    }
  }

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userQuery.trim() || !csvData) return

    // Add the user message to chat history
    setChatHistory((prev) => [...prev, { role: "user", content: userQuery }])

    setLoading(true)
    try {
      // Generate the analysis based on the user query
      const response = await generateAnalysis(csvData, userQuery)

      // Add the AI response to chat history
      setChatHistory((prev) => [...prev, { role: "assistant", content: response.text }])

      // Update the insights if charts are included
      if (response.insights && response.insights.charts) {
        setInsights((prev) => ({
          ...prev,
          charts: [...(prev?.charts || []), ...(response.insights.charts || [])],
        }))
      }
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
      setLoading(false)
      setUserQuery("")
    }
  }

  const handleReset = () => {
    // Clear session storage and redirect to home page
    sessionStorage.removeItem("csvData")
    router.push("/")
  }

  if (!csvData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={handleReset}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <h1 className="text-2xl font-bold ml-4">ProReporter Analysis</h1>
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
                <ChatHistory messages={chatHistory} loading={loading} />

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
                      disabled={loading || !userQuery.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
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
            <InsightPanel insights={insights} loading={loading} />
          </TabsContent>

          <TabsContent value="export">
            <ExportPanel insights={insights} chatHistory={chatHistory} />
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
