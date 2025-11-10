import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatShortcut } from "@/hooks/useKeyboardShortcuts"
import { Command } from "lucide-react"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  {
    category: "Navigation",
    items: [
      { keys: formatShortcut('K', true), description: "Open search / help" },
      { keys: formatShortcut('B', true), description: "Toggle sidebar" },
      { keys: formatShortcut('/', true), description: "Show keyboard shortcuts" },
    ]
  },
  {
    category: "General",
    items: [
      { keys: "Esc", description: "Close dialog / search" },
      { keys: formatShortcut('.', true), description: "Open settings" },
    ]
  },
  {
    category: "Quick Actions",
    items: [
      { keys: formatShortcut('1', true), description: "Go to dashboard" },
      { keys: formatShortcut('2', true), description: "Go to AI Act Copilot" },
      { keys: formatShortcut('3', true), description: "Go to GDPR Copilot" },
      { keys: formatShortcut('4', true), description: "Go to ESG Copilot" },
    ]
  }
]

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate quickly
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
