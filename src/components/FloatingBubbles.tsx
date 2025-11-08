import { useEffect, useState } from "react"

interface Bubble {
  id: number
  left: string
  size: number
  duration: number
  delay: number
}

export function FloatingBubbles({ count = 15 }: { count?: number }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const newBubbles: Bubble[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 8 + 4, // 4-12px
      duration: Math.random() * 8 + 12, // 12-20s
      delay: Math.random() * 5, // 0-5s
    }))
    setBubbles(newBubbles)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bottom-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/15 backdrop-blur-[1px] animate-bubble-rise"
          style={{
            left: bubble.left,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            boxShadow: `
              inset -2px -2px 4px rgba(255, 255, 255, 0.3),
              0 2px 8px rgba(138, 43, 226, 0.1)
            `,
          }}
        />
      ))}
    </div>
  )
}
