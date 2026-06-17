import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  buildConsultationMessage, buildWhatsAppUrl, getAstrologerWhatsAppNumber,
} from "@/lib/whatsapp";

type BookConsultationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  astrologerName: string;
  whatsapp?: string | null;
  phone?: string | null;
  serviceName?: string;
};

export function BookConsultationDialog({
  open,
  onOpenChange,
  astrologerName,
  whatsapp,
  phone,
  serviceName,
}: BookConsultationDialogProps) {
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (open) setTopic("");
  }, [open, serviceName]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (trimmed.length < 5) {
      toast.error("Please describe what you'd like to consult about (at least 5 characters)");
      return;
    }

    const number = getAstrologerWhatsAppNumber({ whatsapp, phone });
    if (!number) {
      toast.error("This astrologer has no WhatsApp number configured yet");
      return;
    }

    const message = buildConsultationMessage({
      astrologerName,
      topic: trimmed,
      serviceName,
    });
    const url = buildWhatsAppUrl(number, message);
    if (!url) {
      toast.error("Invalid WhatsApp number");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[var(--gold)]">
              Book with {astrologerName}
            </DialogTitle>
            <DialogDescription>
              {serviceName
                ? `You selected "${serviceName}". Tell us what you'd like to explore — we'll open WhatsApp with your message ready to send.`
                : "Describe what you'd like to consult about. We'll open WhatsApp with your message ready to send."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label htmlFor="consult-topic" className="text-xs label-caps text-muted-foreground">
              What would you like to consult about? *
            </label>
            <Textarea
              id="consult-topic"
              rows={5}
              autoFocus
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Career transition timing, marriage compatibility, Vastu for my home office…"
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              Continue on WhatsApp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
