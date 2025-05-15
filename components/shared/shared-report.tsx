"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InsightPanel } from "@/components/analysis/insight-panel"
import { Download, ArrowLeft } from "lucide-react"
import html2pdf from "html2pdf.js"

export function SharedReport({ report }: { report: any }) {
  const [loading, setLoading] = useState(false)

  const handleExportPDF = async () => {
    if (!report.insights) return

    setLoading(true)

    try {
      // Create a temporary div to render the content
      const element = document.createElement("div")
      element.className = "export-container"
      element.style.padding = "20px"
      element.style.maxWidth = "800px"
      element.style.margin = "0 auto"
      element.style.backgroundColor = "#fff"
      element.style.color = "#000"

      // Add title
      const title = document.createElement("h1")
      title.textContent = report.title || "ProReporter Analysis"
      title.style.textAlign = "center"
      title.style.marginBottom = "20px"
      element.appendChild(title)

      // Add summary
      if (report.insights.summary) {
        const summaryTitle = document.createElement("h2")
        summaryTitle.textContent = "Summary"
        element.appendChild(summaryTitle)

        const summary = document.createElement("p")
        summary.textContent = report.insights.summary
        element.appendChild(summary)
      }

      // Add trends
      if (report.insights.trends && report.insights.trends.length > 0) {
        const trendsTitle = document.createElement("h2")
        trendsTitle.textContent = "Key Trends"
        element.appendChild(trendsTitle)

        const trendsList = document.createElement("ul")
        report.insights.trends.forEach((trend: string) => {
          const trendItem = document.createElement("li")
          trendItem.textContent = trend
          trendsList.appendChild(trendItem)
        })
        element.appendChild(trendsList)
      }

      // Add timestamp
      const timestamp = document.createElement("p")
      timestamp.textContent = `Generated on ${new Date(report.created_at).toLocaleString()}`
      timestamp.style.marginTop = "30px"
      timestamp.style.fontSize = "12px"
      timestamp.style.color = "#666"
      element.appendChild(timestamp)

      // Append to document temporarily
      document.body.appendChild(element)

      // Generate PDF
      const opt = {
        margin: [10, 10],
        filename: `${report.title || "proreporter"}-analysis.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(element).save()

      // Remove the temporary element
      document.body.removeChild(element)
    } catch (err) {
      console.error("Error exporting PDF:", err)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold ml-4">{report.title}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 hover:border-gray-600"
            onClick={handleExportPDF}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Exporting..." : "Export PDF"}
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle>Shared Report</CardTitle>
            <CardDescription>{report.description || "No description provided"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-400">Created on {formatDate(report.created_at)}</div>
          </CardContent>
        </Card>

        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="insights">
            <InsightPanel insights={report.insights} loading={false} />
          </TabsContent>

          <TabsContent value="data">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Raw Data</CardTitle>
                <CardDescription>Preview of the first 10 rows of data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {report.data && report.data.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800">
                          {Object.keys(report.data[0]).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-gray-400">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.data.slice(0, 10).map((row: any, rowIndex: number) => (
                          <tr key={rowIndex} className="border-b border-gray-800">
                            {Object.values(row).map((value: any, valueIndex: number) => (
                              <td key={valueIndex} className="px-4 py-2 text-gray-300">
                                {typeof value === "object" ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
