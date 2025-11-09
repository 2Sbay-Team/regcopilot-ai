import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusData {
  aiAct: { count: number; lastUpdate: Date | null; status: 'active' | 'idle' | 'error' }
  gdpr: { count: number; lastUpdate: Date | null; status: 'active' | 'idle' | 'error' }
  esg: { count: number; lastUpdate: Date | null; status: 'active' | 'idle' | 'error' }
  audit: { count: number; lastUpdate: Date | null; status: 'active' | 'idle' | 'error' }
}

export function RealTimeStatusIndicator() {
  const [status, setStatus] = useState<StatusData>({
    aiAct: { count: 0, lastUpdate: null, status: 'idle' },
    gdpr: { count: 0, lastUpdate: null, status: 'idle' },
    esg: { count: 0, lastUpdate: null, status: 'idle' },
    audit: { count: 0, lastUpdate: null, status: 'idle' },
  })
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'offline'>('operational')

  useEffect(() => {
    // Subscribe to real-time changes
    const aiActChannel = supabase
      .channel('ai-act-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_systems'
        },
        (payload) => {
          setStatus(prev => ({
            ...prev,
            aiAct: {
              count: prev.aiAct.count + 1,
              lastUpdate: new Date(),
              status: 'active'
            }
          }))
          setTimeout(() => {
            setStatus(prev => ({
              ...prev,
              aiAct: { ...prev.aiAct, status: 'idle' }
            }))
          }, 3000)
        }
      )
      .subscribe()

    const gdprChannel = supabase
      .channel('gdpr-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gdpr_assessments'
        },
        (payload) => {
          setStatus(prev => ({
            ...prev,
            gdpr: {
              count: prev.gdpr.count + 1,
              lastUpdate: new Date(),
              status: 'active'
            }
          }))
          setTimeout(() => {
            setStatus(prev => ({
              ...prev,
              gdpr: { ...prev.gdpr, status: 'idle' }
            }))
          }, 3000)
        }
      )
      .subscribe()

    const esgChannel = supabase
      .channel('esg-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'esg_reports'
        },
        (payload) => {
          setStatus(prev => ({
            ...prev,
            esg: {
              count: prev.esg.count + 1,
              lastUpdate: new Date(),
              status: 'active'
            }
          }))
          setTimeout(() => {
            setStatus(prev => ({
              ...prev,
              esg: { ...prev.esg, status: 'idle' }
            }))
          }, 3000)
        }
      )
      .subscribe()

    const auditChannel = supabase
      .channel('audit-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        (payload) => {
          setStatus(prev => ({
            ...prev,
            audit: {
              count: prev.audit.count + 1,
              lastUpdate: new Date(),
              status: 'active'
            }
          }))
          setTimeout(() => {
            setStatus(prev => ({
              ...prev,
              audit: { ...prev.audit, status: 'idle' }
            }))
          }, 3000)
        }
      )
      .subscribe()

    // Check system health periodically
    const healthCheck = setInterval(() => {
      const hasRecentActivity = Object.values(status).some(
        s => s.lastUpdate && (Date.now() - s.lastUpdate.getTime()) < 60000
      )
      setSystemStatus(hasRecentActivity ? 'operational' : 'degraded')
    }, 10000)

    return () => {
      supabase.removeChannel(aiActChannel)
      supabase.removeChannel(gdprChannel)
      supabase.removeChannel(esgChannel)
      supabase.removeChannel(auditChannel)
      clearInterval(healthCheck)
    }
  }, [])

  const getStatusIcon = (moduleStatus: 'active' | 'idle' | 'error') => {
    switch (moduleStatus) {
      case 'active':
        return <Activity className="h-3 w-3 text-accent animate-pulse" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-destructive" />
      default:
        return <CheckCircle className="h-3 w-3 text-primary" />
    }
  }

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational':
        return 'bg-accent'
      case 'degraded':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-destructive'
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Overall System Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
        <div className={cn("h-2 w-2 rounded-full animate-pulse", getSystemStatusColor())} />
        <span className="text-xs font-semibold text-accent uppercase tracking-wide">
          {systemStatus === 'operational' ? 'All Systems Active' : 'System Status'}
        </span>
      </div>

      {/* Module Status Indicators */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
          {getStatusIcon(status.aiAct.status)}
          <span className="font-medium">AI Act</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
          {getStatusIcon(status.gdpr.status)}
          <span className="font-medium">GDPR</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
          {getStatusIcon(status.esg.status)}
          <span className="font-medium">ESG</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
          {getStatusIcon(status.audit.status)}
          <span className="font-medium">Audit</span>
        </div>
      </div>

      {/* Last Activity */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {Object.values(status).some(s => s.lastUpdate)
            ? `Last activity: ${Math.floor((Date.now() - Math.max(...Object.values(status).map(s => s.lastUpdate?.getTime() || 0))) / 1000)}s ago`
            : 'No recent activity'}
        </span>
      </div>
    </div>
  )
}
