import { ProtectedRoute } from "@/components/auth/protected-route"
import { UploadForm } from "@/components/upload/upload-form"

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">Upload Data for Analysis</h1>
          <UploadForm />
        </div>
      </div>
    </ProtectedRoute>
  )
}
