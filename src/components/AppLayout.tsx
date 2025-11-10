import { ReactNode, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { LogOut, User, Settings, HelpCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/lib/i18n"
import { Footer } from "@/components/Footer"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationCenter } from "@/components/NotificationCenter"

interface AppLayoutProps {
  children: ReactNode
}

function AppLayoutInner({ children }: AppLayoutProps) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { toggleSidebar } = useSidebar()
  const [userName, setUserName] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [orgName, setOrgName] = useState<string>('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, display_name, organizations(name)')
        .eq('id', user.id)
        .single()
      if (data?.display_name) setUserName(data.display_name)
      else if (data?.full_name) setUserName(data.full_name)
      if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      if (data?.organizations?.name) setOrgName(data.organizations.name)
    }
    loadProfile()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const userInitials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : user?.email?.charAt(0).toUpperCase() || "U"

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'b',
      ctrlOrCmd: true,
      handler: () => toggleSidebar(),
      description: 'Toggle sidebar'
    },
    {
      key: '/',
      ctrlOrCmd: true,
      handler: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts'
    },
    {
      key: '.',
      ctrlOrCmd: true,
      handler: () => navigate('/settings'),
      description: 'Open settings'
    },
    {
      key: '1',
      ctrlOrCmd: true,
      handler: () => navigate('/dashboard'),
      description: 'Go to dashboard'
    },
    {
      key: '2',
      ctrlOrCmd: true,
      handler: () => navigate('/ai-act'),
      description: 'Go to AI Act Copilot'
    },
    {
      key: '3',
      ctrlOrCmd: true,
      handler: () => navigate('/gdpr'),
      description: 'Go to GDPR Copilot'
    },
    {
      key: '4',
      ctrlOrCmd: true,
      handler: () => navigate('/esg'),
      description: 'Go to ESG Copilot'
    }
  ])

  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="hover:bg-accent/50" />

              <div className="flex-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/help")}
                className="hover:bg-accent/50"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <NotificationCenter />

              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/50">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72 bg-popover border shadow-lg z-50" align="end" forceMount>
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="truncate">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/dashboard')}
                      className="cursor-pointer py-3 px-3 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 font-medium">Personal account</span>
                        <span className="text-primary">✓</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/billing')}
                      className="cursor-pointer py-2.5 px-3 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-5 w-5 flex items-center justify-center">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <span>Upgrade plan</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer py-2.5 px-3 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="cursor-pointer py-2.5 px-3 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                      onClick={() => navigate('/help-center')}
                      className="cursor-pointer py-2.5 px-3 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <HelpCircle className="h-5 w-5" />
                        <span>Help</span>
                        <span className="ml-auto text-muted-foreground">→</span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer py-2.5 px-3 hover:bg-accent/50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 animate-in fade-in duration-300">
            {children}
          </main>

          <Footer />
        </div>

        <KeyboardShortcutsDialog 
          open={showShortcuts} 
          onOpenChange={setShowShortcuts} 
        />
      </div>
    </>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  )
}

