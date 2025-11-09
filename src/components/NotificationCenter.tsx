import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface Notification {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export const NotificationCenter = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    // Get profile to check quota warnings
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single()

    if (!profile?.organization_id) return

    const { data: org } = await supabase
      .from('organizations')
      .select('llm_token_quota, tokens_used_this_month, billing_model')
      .eq('id', profile.organization_id)
      .single()

    const mockNotifications: Notification[] = []

    // Add token usage warning if needed
    if (org && org.billing_model !== 'byok') {
      const usagePercentage = (org.tokens_used_this_month / org.llm_token_quota) * 100
      if (usagePercentage >= 80) {
        mockNotifications.push({
          id: '1',
          type: 'warning',
          title: 'Token Usage Alert',
          message: `You've used ${usagePercentage.toFixed(0)}% of your monthly token quota`,
          timestamp: new Date().toISOString(),
          read: false
        })
      }
    }

    // Add welcome notification
    mockNotifications.push({
      id: '2',
      type: 'info',
      title: 'Welcome to RegSense',
      message: 'Start by running your first compliance assessment',
      timestamp: new Date().toISOString(),
      read: false
    })

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return 'text-amber-500'
      case 'success': return 'text-green-500'
      default: return 'text-blue-500'
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors mb-1 ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Bell className={`h-4 w-4 mt-0.5 ${getTypeColor(notification.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
