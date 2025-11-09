import { useState } from "react"
import { ThumbsUp, ThumbsDown, AlertTriangle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface FeedbackButtonProps {
  chunkId: string
  content?: string
  className?: string
}

export const FeedbackButton = ({ chunkId, content, className }: FeedbackButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitFeedback = async (signal: 'upvote' | 'downvote' | 'missing' | 'irrelevant' | 'good_citation') => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.functions.invoke('feedback-handler', {
        body: {
          feedback_type: 'chunk',
          chunk_id: chunkId,
          signal,
          notes: notes || undefined
        }
      })

      if (error) throw error

      toast.success('Thank you! Your feedback helps improve retrieval accuracy.')
      setIsOpen(false)
      setNotes("")
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Feedback
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">How relevant was this citation?</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => submitFeedback('upvote')}
                disabled={isSubmitting}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => submitFeedback('downvote')}
                disabled={isSubmitting}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Not Helpful
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => submitFeedback('missing')}
                disabled={isSubmitting}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Missing Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => submitFeedback('irrelevant')}
                disabled={isSubmitting}
              >
                Irrelevant
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional notes (optional)
            </label>
            <Textarea
              placeholder="Tell us more about your feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => submitFeedback('good_citation')}
            disabled={isSubmitting}
          >
            Submit with Notes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
