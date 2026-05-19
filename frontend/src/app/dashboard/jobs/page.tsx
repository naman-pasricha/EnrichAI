"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JobsTable } from '@/components/JobsTable'
import { Button } from '@/components/ui/button'
import { DownloadCloud, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Jobs & Results</h1>
          <p className="text-slate-500 mt-1">View and download your enriched lead lists.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <DownloadCloud className="h-4 w-4" />
            Export Selected
          </Button>
          <Button className="gap-2">
            <DownloadCloud className="h-4 w-4" />
            Export All CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Founders List - Q3 Batch</CardTitle>
              <CardDescription>Processed today at 10:45 AM • 450 rows</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search leads..." 
                className="pl-9 bg-slate-50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <JobsTable data={[]} />
        </CardContent>
      </Card>
    </div>
  )
}
