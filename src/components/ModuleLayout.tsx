import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/Footer"
import { RealTimeStatusIndicator } from "@/components/RealTimeStatusIndicator"
import { useLanguage } from "@/contexts/LanguageContext"

interface QuickAction {
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: "default" | "outline"
  gradient?: boolean
}

interface ModuleLayoutProps {
  children: ReactNode
  title: string | ReactNode
  description?: string | ReactNode
  quickActions?: QuickAction[]
  showStatus?: boolean
}

export const ModuleLayout = ({ 
  children, 
  title, 
  description,
  quickActions = [],
  showStatus = true 
}: ModuleLayoutProps) => {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Main Content Area */}
      <div className="flex-1">
        <div className="container mx-auto px-6 py-6 space-y-6">
          {/* Page Title & Status */}
          <div className="flex items-center justify-between p-6 rounded-2xl cockpit-panel">
            <div>
              <h1 className="text-4xl tracking-tight mb-2 heading-dual-tone">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground font-medium">{description}</p>
              )}
            </div>
            {showStatus && <RealTimeStatusIndicator />}
          </div>

          {/* Quick Action Bar */}
          {quickActions.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "outline"}
                  className={
                    action.gradient
                      ? "gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                      : "gap-2 border-2 hover:bg-muted/50 transition-all duration-300"
                  }
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
