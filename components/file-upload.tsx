"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
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

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Parse CSV to JSON
      const jsonData = await parseCSV(file)

      // Store the parsed data in session storage (for demo purposes)
      // In a production app, you might want to use a more robust state management solution
      sessionStorage.setItem("csvData", JSON.stringify(jsonData))

      // Navigate to the analysis page
      router.push("/analysis")
    } catch (err) {
      console.error("Error processing file:", err)
      setError("Failed to process the CSV file. Please check the file format and try again.")
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
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
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

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            <div className="mt-4">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Analyze Data</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
