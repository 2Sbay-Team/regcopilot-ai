import { useEffect, useRef } from "react"

interface CircuitBackgroundProps {
  density?: "low" | "medium" | "high"
  speed?: "slow" | "medium" | "fast"
}

export function CircuitBackground({ 
  density = "medium", 
  speed = "medium" 
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const getDensityValue = () => {
    switch (density) {
      case "low": return 15
      case "medium": return 25
      case "high": return 40
      default: return 25
    }
  }

  const getSpeedValue = () => {
    switch (speed) {
      case "slow": return "40s"
      case "medium": return "25s"
      case "fast": return "15s"
      default: return "25s"
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const container = canvasRef.current
    const lineCount = getDensityValue()
    
    // Clear existing lines
    container.innerHTML = ''

    // Create horizontal and vertical lines
    for (let i = 0; i < lineCount; i++) {
      // Horizontal lines
      const hLine = document.createElement('div')
      hLine.className = 'circuit-line circuit-line-horizontal'
      hLine.style.top = `${Math.random() * 100}%`
      hLine.style.animationDelay = `${Math.random() * 5}s`
      hLine.style.animationDuration = getSpeedValue()
      container.appendChild(hLine)

      // Vertical lines
      const vLine = document.createElement('div')
      vLine.className = 'circuit-line circuit-line-vertical'
      vLine.style.left = `${Math.random() * 100}%`
      vLine.style.animationDelay = `${Math.random() * 5}s`
      vLine.style.animationDuration = getSpeedValue()
      container.appendChild(vLine)
    }

    // Create data nodes (intersection points)
    const nodeCount = Math.floor(lineCount * 0.6)
    for (let i = 0; i < nodeCount; i++) {
      const node = document.createElement('div')
      node.className = 'circuit-node'
      node.style.top = `${Math.random() * 100}%`
      node.style.left = `${Math.random() * 100}%`
      node.style.animationDelay = `${Math.random() * 3}s`
      container.appendChild(node)
    }

    // Create data particles
    const particleCount = Math.floor(lineCount * 0.8)
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'circuit-particle'
      particle.style.top = `${Math.random() * 100}%`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * 6}s`
      particle.style.animationDuration = `${8 + Math.random() * 12}s`
      container.appendChild(particle)
    }
  }, [density, speed])

  return (
    <>
      {/* Grid pattern overlay */}
      <div className="circuit-grid" />
      
      {/* Dynamic circuit lines and nodes */}
      <div 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      />
    </>
  )
}
