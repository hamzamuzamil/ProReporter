import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, AlertTriangle, Search } from "lucide-react"
import { ChartDisplay } from "@/components/chart-display"

export function InsightPanel({
  insights,
  loading,
}: {
  insights: any | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-gray-400">Generating insights...</span>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Search className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-medium mb-2">No insights available</h3>
        <p>Ask questions in the Chat tab to generate insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">{insights.summary || "No summary available"}</p>
        </CardContent>
      </Card>

      {/* Key Trends */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Key Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.trends ? (
            <ul className="space-y-2 text-gray-300">
              {insights.trends.map((trend: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 mr-2"></span>
                  {trend}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No trends identified</p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Visualizations</h3>

        {insights.charts && insights.charts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.charts.map((chart: any, index: number) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>{chart.title || `Chart ${index + 1}`}</CardTitle>
                  {chart.description && (
                    <CardDescription className="text-gray-400">{chart.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <ChartDisplay chartData={chart} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-8 text-center text-gray-500">
              <p>No charts available. Try asking for specific visualizations in the Chat tab.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
