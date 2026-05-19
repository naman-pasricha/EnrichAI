"use client"
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

interface FileUploadProps {
  onUpload: (file: File) => void
  isUploading?: boolean
}

export function FileUpload({ onUpload, isUploading = false }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const file = acceptedFiles[0]
    
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload a valid CSV or Excel file.')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isUploading
  })

  const handleProcess = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer",
          isDragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50",
          (isUploading || selectedFile) && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        {!selectedFile ? (
          <>
            <div className="h-14 w-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Click to upload or drag and drop</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              CSV or Excel file containing a single column with header <code className="bg-slate-100 px-1 rounded text-slate-700 font-mono">linkedin_url</code>
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-14 w-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <FileType className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedFile.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedFile(null)
                }}
                disabled={isUploading}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {selectedFile && (
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleProcess} 
            disabled={isUploading}
            size="lg"
            className="w-full sm:w-auto shadow-md"
          >
            {isUploading ? 'Uploading & Processing...' : 'Start Enrichment Processing'}
          </Button>
        </div>
      )}
    </div>
  )
}
