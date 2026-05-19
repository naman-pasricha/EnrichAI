"use client"
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/FileUpload'
import { Users, CheckCircle, Clock, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadSuccess(false)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const token = useAuthStore.getState().token
      
      await axios.post('https://poor-shrimps-appear.loca.lt/api/v1/jobs/', formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}`,
          'Bypass-Tunnel-Reminder': 'true'
        } 
      })
      
      setIsUploading(false)
      setUploadSuccess(true)
    } catch (error) {
      console.error(error)
      setIsUploading(false)
      alert("Failed to upload file")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here is what's happening with your enrichments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-500 text-sm">Credits Available</h3>
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{user?.credits?.toLocaleString() || "Unlimited"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-500 text-sm">Total Leads Enriched</h3>
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900">1,248</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-500 text-sm">Jobs Completed</h3>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-500 text-sm">Active Jobs</h3>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>New Enrichment Job</CardTitle>
              <CardDescription>Upload a CSV with LinkedIn URLs to start finding contact information.</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center flex flex-col items-center">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-1">Job successfully queued!</h3>
                  <p className="text-emerald-700 text-sm mb-4">Your file is now being processed. You can track its progress in the Jobs tab.</p>
                  <button 
                    onClick={() => setUploadSuccess(false)}
                    className="text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-4 py-2 rounded-md transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              ) : (
                <FileUpload onUpload={handleFileUpload} isUploading={isUploading} />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your latest processing activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'founders_list.csv', status: 'Completed', rows: 450, date: '2 hrs ago' },
                  { name: 'nyc_investors.csv', status: 'Completed', rows: 120, date: 'Yesterday' },
                  { name: 'tech_leads_q3.csv', status: 'Completed', rows: 850, date: 'May 15' },
                ].map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-medium text-sm text-slate-900 truncate max-w-[150px]">{job.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{job.date} • {job.rows} rows</div>
                    </div>
                    <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-transparent hover:bg-emerald-100">{job.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
