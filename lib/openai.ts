import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export async function generateAnalysis(data: any[], prompt: string) {
  try {
    // Define the schema for the response
    const responseSchema = z.object({
      text: z.string().describe("The text response to the user's query"),
      insights: z.object({
        summary: z.string().optional().describe("A 2-3 sentence summary of the data"),
        trends: z.array(z.string()).optional().describe("Key trends identified in the data"),
        charts: z
          .array(
            z.object({
              chartType: z.enum(["bar", "line", "pie", "area", "scatter"]).describe("The type of chart to display"),
              title: z.string().describe("The title of the chart"),
              description: z.string().optional().describe("A brief description of what the chart shows"),
              xAxis: z.string().optional().describe("The data key to use for the x-axis"),
              yAxis: z.string().optional().describe("The data key to use for the y-axis"),
              data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))).describe("The data for the chart"),
            }),
          )
          .optional()
          .describe("Chart configurations to display"),
      }),
    })

    // Use the AI SDK's generateObject function
    const result = await generateObject({
      model: openai("gpt-4o"),
      system: `You are an AI data analyst that helps users analyze CSV data. 
      Your task is to analyze the provided data and generate insights.
      When asked to create charts, you should return properly formatted chart configurations.
      Always return your response in the specified format.`,
      prompt: `Analyze this data: ${JSON.stringify(data)}. 
      User query: ${prompt}
      
      If the user asks for a chart, make sure to include a properly formatted chart configuration.
      For charts, use the actual data values from the provided dataset.`,
      schema: responseSchema,
    })

    return result
  } catch (error) {
    console.error("Error generating analysis:", error)
    // Return a fallback response
    return {
      text: "I'm sorry, I couldn't analyze your data. There might be an issue with the data format or my connection to the AI service.",
      insights: {
        summary: "Analysis could not be generated.",
        trends: ["No trends could be identified."],
        charts: [],
      },
    }
  }
}
