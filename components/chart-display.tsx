"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { ChartTooltip } from "@/components/ui/chart"
import {
  Bar,
  Line,
  Pie,
  Scatter,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"

type ChartData = {
  chartType: string
  title: string
  description?: string
  xAxis?: string
  yAxis?: string
  data: any[]
}

export function ChartDisplay({ chartData }: { chartData: ChartData }) {
  const [tooltipData, setTooltipData] = useState<any>(null)

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertTriangle className="h-8 w-8 mb-2 text-yellow-500" />
        <p>Chart not available. Try another question.</p>
      </div>
    )
  }

  const renderChart = () => {
    const type = chartData.chartType?.toLowerCase()

    // Common props for all chart types
    const commonProps = {
      data: chartData.data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    }

    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={chartData.xAxis} tick={{ fill: "#aaa" }} stroke="#555" />
              <YAxis tick={{ fill: "#aaa" }} stroke="#555" />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#aaa" }} />
              <Bar
                dataKey={chartData.yAxis}
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
                onMouseOver={(data) => setTooltipData(data)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={chartData.xAxis} tick={{ fill: "#aaa" }} stroke="#555" />
              <YAxis tick={{ fill: "#aaa" }} stroke="#555" />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#aaa" }} />
              <Line
                type="monotone"
                dataKey={chartData.yAxis}
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                onMouseOver={(data) => setTooltipData(data)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <Pie
              data={chartData.data}
              dataKey={chartData.yAxis}
              nameKey={chartData.xAxis}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
              onMouseOver={(data) => setTooltipData(data)}
            />
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={chartData.xAxis} tick={{ fill: "#aaa" }} stroke="#555" />
              <YAxis tick={{ fill: "#aaa" }} stroke="#555" />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#aaa" }} />
              <Area
                type="monotone"
                dataKey={chartData.yAxis}
                fill="#8884d8"
                stroke="#8884d8"
                fillOpacity={0.3}
                onMouseOver={(data) => setTooltipData(data)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={chartData.xAxis} tick={{ fill: "#aaa" }} stroke="#555" />
              <YAxis tick={{ fill: "#aaa" }} stroke="#555" />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#aaa" }} />
              <Scatter dataKey={chartData.yAxis} fill="#8884d8" onMouseOver={(data) => setTooltipData(data)} />
            </ComposedChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <AlertTriangle className="h-8 w-8 mb-2 text-yellow-500" />
            <p>Unsupported chart type: {type}</p>
          </div>
        )
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardContent className="p-2 text-xs">
            {label && <p className="font-medium text-gray-300">{label}</p>}
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color || "#fff" }}>
                {`${entry.name}: ${entry.value}`}
              </p>
            ))}
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return <div className="w-full h-[300px]">{renderChart()}</div>
}
