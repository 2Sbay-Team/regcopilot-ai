import { useEffect } from "react"

interface ShortcutConfig {
  key: string
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description: string
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const modifierKey = isMac ? event.metaKey : event.ctrlKey

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrlOrCmd ? modifierKey : !modifierKey
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export const formatShortcut = (key: string, ctrlOrCmd?: boolean, shift?: boolean, alt?: boolean) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const parts: string[] = []
  
  if (ctrlOrCmd) parts.push(isMac ? '⌘' : 'Ctrl')
  if (shift) parts.push(isMac ? '⇧' : 'Shift')
  if (alt) parts.push(isMac ? '⌥' : 'Alt')
  parts.push(key.toUpperCase())
  
  return parts.join(isMac ? '' : '+')
}
