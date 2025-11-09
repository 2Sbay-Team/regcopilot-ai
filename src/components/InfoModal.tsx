import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  title: string;
  description: string;
  example?: string;
}

export function InfoModal({ title, description, example }: InfoModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`More information about ${title}`}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-left pt-4">
            {description}
          </DialogDescription>
        </DialogHeader>
        {example && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-semibold mb-2 text-foreground">Example:</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{example}</p>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
