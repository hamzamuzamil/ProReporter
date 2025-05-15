"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import Papa from "papaparse"

export function UploadForm() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)

    if (!selectedFile) return

    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file first")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title for your report")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Parse CSV to JSON
      const jsonData = await parseCSV(file)

      // Create a new report in the database
      const { data, error: insertError } = await supabase
        .from("reports")
        .insert({
          title,
          description,
          user_id: user?.id,
          data: jsonData,
        })
        .select()

      if (insertError) throw insertError

      // Navigate to the analysis page
      router.push(`/analysis/${data[0].id}`)
    } catch (err: any) {
      console.error("Error processing file:", err)
      setError(err.message || "Failed to process the CSV file. Please check the file format and try again.")
    } finally {
      setUploading(false)
    }
  }

  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(results.errors)
          } else {
            resolve(results.data)
          }
        },
        error: (error) => {
          reject(error)
        },
      })
    })
  }

  return (
    <Card className="bg-gray-900 border-gray-800 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload CSV Data</CardTitle>
        <CardDescription>Upload a CSV file to analyze with AI and generate insights</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Q2 Sales Analysis"
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this data set"
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">CSV File</Label>
            <div className="mt-1">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-700 hover:border-purple-500 bg-gray-800 hover:bg-gray-800/50 transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-8 h-8 mb-2 text-purple-500" />
                      <p className="text-sm text-gray-300">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">CSV files only</p>
                    </>
                  )}
                </div>
                <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={!file || !title.trim() || uploading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Analyze Data"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
