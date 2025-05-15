import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type Message = {
  role: string
  content: string
}

export function ChatHistory({
  messages,
  loading,
}: {
  messages: Message[]
  loading: boolean
}) {
  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <Card
            className={`max-w-[80%] ${
              message.role === "user" ? "bg-purple-600 border-purple-700" : "bg-gray-800 border-gray-700"
            }`}
          >
            <CardContent className="p-3 text-sm">{message.content}</CardContent>
          </Card>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <Card className="max-w-[80%] bg-gray-800 border-gray-700">
            <CardContent className="p-3 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Analyzing data...</span>
            </CardContent>
          </Card>
        </div>
      )}

      {messages.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No messages yet. Start by asking a question about your data.
        </div>
      )}
    </div>
  )
}
