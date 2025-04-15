
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
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
  );
}
