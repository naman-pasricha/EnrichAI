"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Settings, LogOut, Hexagon, FileSpreadsheet, FileCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/dashboard/jobs', icon: FileSpreadsheet },
    { name: 'Results for Upload', href: '/dashboard/results', icon: FileCheck },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Hexagon className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">EnrichAI</span>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-blue-700" : "text-slate-400")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100">
            <div className="text-xs text-slate-500 mb-1">Credits Remaining</div>
            <div className="font-semibold text-slate-900 text-lg">{user?.credits || "Unlimited"}</div>
            <Link href="/dashboard/billing" className="text-blue-600 text-xs font-medium hover:underline mt-1 inline-block">
              Upgrade Plan
            </Link>
          </div>
          <button
            onClick={() => {
              logout()
              router.push('/login')
            }}
            className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:hidden">
            <span className="font-bold text-lg text-slate-900">EnrichAI</span>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
