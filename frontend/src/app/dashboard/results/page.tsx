"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JobsTable } from '@/components/JobsTable'
import { Button } from '@/components/ui/button'
import { DownloadCloud, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/useAuthStore'
import axios from 'axios'

export default function ResultsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    async function fetchResults() {
      if (!token) return;
      try {
        // Fetch jobs first
        const jobsRes = await axios.get('https://poor-shrimps-appear.loca.lt/api/v1/jobs/', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Bypass-Tunnel-Reminder': 'true'
          }
        });
        
        if (jobsRes.data.length > 0) {
          const latestJobId = jobsRes.data[0].id;
          // Fetch leads for the latest job
          const leadsRes = await axios.get(`https://poor-shrimps-appear.loca.lt/api/v1/jobs/${latestJobId}/leads`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Bypass-Tunnel-Reminder': 'true'
            }
          });
          setData(leadsRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResults();
    
    // Poll every 5 seconds to get updates
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [token])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Results for Upload</h1>
          <p className="text-slate-500 mt-1">View enriched data including extracted Emails and Phone numbers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <DownloadCloud className="h-4 w-4" />
            Export Selected
          </Button>
          <Button className="gap-2">
            <DownloadCloud className="h-4 w-4" />
            Export All (.xlsx)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Latest Upload Processing Results
                {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              </CardTitle>
              <CardDescription>Successfully extracted profiles with Contact Information</CardDescription>
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
          <JobsTable data={data} />
        </CardContent>
      </Card>
    </div>
  )
}
