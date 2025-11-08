import { useCallback } from "react"

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "selection"

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 100, 50],
  selection: 5,
}

export const useHaptic = () => {
  const vibrate = useCallback((pattern: HapticPattern = "light") => {
    // Check if vibration API is supported
    if (!("vibrate" in navigator)) {
      return
    }

    try {
      const vibrationPattern = hapticPatterns[pattern]
      navigator.vibrate(vibrationPattern)
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug("Haptic feedback not available:", error)
    }
  }, [])

  return { vibrate }
}
