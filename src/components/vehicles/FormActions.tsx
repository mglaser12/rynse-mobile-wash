
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isProcessing: boolean;
}

export function FormActions({
  onCancel,
  isLoading,
  isProcessing
}: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading || isProcessing}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Save Vehicle
          </>
        )}
      </Button>
    </div>
  );
}
