
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onContinue?: () => void;
}

export function NotesSection({ notes, onNotesChange, onContinue }: NotesSectionProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special instructions or requests..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
        />
      </div>
      
      {onContinue && (
        <Button 
          type="button" 
          className="w-full" 
          onClick={onContinue}
        >
          Continue to Summary
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
