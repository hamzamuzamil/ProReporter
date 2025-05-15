"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Download, LinkIcon, Copy, Check } from "lucide-react"
import html2pdf from "html2pdf.js"

export function ExportPanel({
  insights,
  chatHistory,
}: {
  insights: any | null
  chatHistory: Array<{ role: string; content: string }>
}) {
  const [loading, setLoading] = useState(false)
  const [shareableLink, setShareableLink] = useState("")
  const [copied, setCopied] = useState(false)

  const handleExportPDF = async () => {
    if (!insights) return

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
      title.textContent = "ProReporter Analysis"
      title.style.textAlign = "center"
      title.style.marginBottom = "20px"
      element.appendChild(title)

      // Add summary
      if (insights.summary) {
        const summaryTitle = document.createElement("h2")
        summaryTitle.textContent = "Summary"
        element.appendChild(summaryTitle)

        const summary = document.createElement("p")
        summary.textContent = insights.summary
        element.appendChild(summary)
      }

      // Add trends
      if (insights.trends && insights.trends.length > 0) {
        const trendsTitle = document.createElement("h2")
        trendsTitle.textContent = "Key Trends"
        element.appendChild(trendsTitle)

        const trendsList = document.createElement("ul")
        insights.trends.forEach((trend: string) => {
          const trendItem = document.createElement("li")
          trendItem.textContent = trend
          trendsList.appendChild(trendItem)
        })
        element.appendChild(trendsList)
      }

      // Add charts (as images)
      if (insights.charts && insights.charts.length > 0) {
        const chartsTitle = document.createElement("h2")
        chartsTitle.textContent = "Visualizations"
        element.appendChild(chartsTitle)

        // For a real implementation, you would need to convert charts to images
        // This is a simplified version
        const chartsNote = document.createElement("p")
        chartsNote.textContent = `${insights.charts.length} charts are included in the analysis.`
        element.appendChild(chartsNote)
      }

      // Add timestamp
      const timestamp = document.createElement("p")
      timestamp.textContent = `Generated on ${new Date().toLocaleString()}`
      timestamp.style.marginTop = "30px"
      timestamp.style.fontSize = "12px"
      timestamp.style.color = "#666"
      element.appendChild(timestamp)

      // Append to document temporarily
      document.body.appendChild(element)

      // Generate PDF
      const opt = {
        margin: [10, 10],
        filename: "proreporter-analysis.pdf",
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

  const handleGenerateLink = () => {
    setLoading(true)

    // In a real implementation, you would save the data to a database
    // and generate a unique link. This is a simplified version.
    setTimeout(() => {
      const uniqueId = Math.random().toString(36).substring(2, 10)
      setShareableLink(`https://proreporter.example/share/${uniqueId}`)
      setLoading(false)
    }, 1500)
  }

  const handleCopyLink = () => {
    if (!shareableLink) return

    navigator.clipboard.writeText(shareableLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  if (!insights) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-16 text-center text-gray-500">
          <p>No data available to export. Generate insights first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription className="text-gray-400">Export your analysis in different formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button onClick={handleExportPDF} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium mb-2">Shareable Link</h3>
            <div className="flex gap-2">
              <Input
                value={shareableLink}
                readOnly
                placeholder="Generate a shareable link"
                className="bg-gray-800 border-gray-700"
              />
              {shareableLink ? (
                <Button size="icon" variant="outline" onClick={handleCopyLink} className="border-gray-700">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              ) : (
                <Button onClick={handleGenerateLink} disabled={loading} variant="outline" className="border-gray-700">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Export Preview</CardTitle>
          <CardDescription className="text-gray-400">Preview of the content that will be exported</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.summary && (
            <div>
              <h3 className="text-sm font-medium mb-1 text-gray-400">Summary</h3>
              <p className="text-gray-300">{insights.summary}</p>
            </div>
          )}

          {insights.trends && insights.trends.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1 text-gray-400">Key Trends</h3>
              <ul className="list-disc pl-5 text-gray-300">
                {insights.trends.map((trend: string, index: number) => (
                  <li key={index}>{trend}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.charts && insights.charts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1 text-gray-400">Charts</h3>
              <p className="text-gray-300">{insights.charts.length} visualization(s) included</p>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-2">Generated on {new Date().toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
