import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
          ProReporter
        </h1>
        <AuthForm />
      </div>
    </div>
  )
}
