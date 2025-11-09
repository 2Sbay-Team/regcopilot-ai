import { useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  title: string
  thumbnail: string
  videoUrl?: string
  className?: string
}

export function VideoPlayer({ title, thumbnail, videoUrl, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  // Generate thumbnail gradient based on video type
  const getThumbnailGradient = () => {
    const gradients = {
      overview: "from-blue-500 to-indigo-600",
      "ai-act": "from-purple-500 to-pink-600",
      gdpr: "from-emerald-500 to-teal-600",
      esg: "from-green-500 to-emerald-600",
      nis2: "from-orange-500 to-red-600",
      dora: "from-cyan-500 to-blue-600",
      connectors: "from-violet-500 to-purple-600",
      audit: "from-amber-500 to-orange-600"
    }
    return gradients[thumbnail as keyof typeof gradients] || "from-gray-500 to-gray-600"
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, this would control actual video playback
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-background border shadow-lg", className)}>
      {/* Video Thumbnail/Player */}
      <div className={cn(
        "relative aspect-video bg-gradient-to-br flex items-center justify-center",
        getThumbnailGradient()
      )}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
        </div>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="relative z-10 group"
            aria-label="Play video"
          >
            <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="h-10 w-10 text-primary ml-1" fill="currentColor" />
            </div>
          </button>
        )}

        {/* Video Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg line-clamp-2">{title}</h3>
        </div>

        {/* Playing State with Controls Preview */}
        {isPlaying && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <p className="text-white text-sm">Video content loading...</p>
              <p className="text-white/70 text-xs max-w-xs mx-auto">
                In production, this would play actual tutorial videos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="p-3 bg-muted/30 backdrop-blur-sm border-t space-y-2">
        {/* Progress Bar */}
        <Slider
          value={[progress]}
          onValueChange={(value) => setProgress(value[0])}
          max={100}
          step={1}
          className="cursor-pointer"
        />

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMuteToggle}
              className="h-8 w-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <span className="text-xs text-muted-foreground font-mono">
              00:00 / 00:00
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
