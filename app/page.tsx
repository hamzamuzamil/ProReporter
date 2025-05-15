"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BarChart3, FileText, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          ProReporter
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Transform your CSV data into actionable insights with AI-powered analysis
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            asChild
          >
            <Link href="/auth">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-700 text-gray-300 hover:text-white hover:border-gray-600"
            asChild
          >
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-purple-500" />}
            title="AI-Powered Analysis"
            description="Upload your CSV data and get instant insights powered by OpenAI's GPT-4 technology."
          />
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-pink-500" />}
            title="Dynamic Visualizations"
            description="Automatically generate beautiful charts based on your data and questions."
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-blue-500" />}
            title="Easy Sharing"
            description="Export your insights as PDF or generate shareable links to collaborate with your team."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 ProReporter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
