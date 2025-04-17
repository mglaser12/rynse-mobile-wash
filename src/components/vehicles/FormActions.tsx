
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  isProcessing?: boolean;
  submitDisabled?: boolean;
}

export function FormActions({
  onCancel,
  isLoading = false,
  isProcessing = false,
  submitDisabled = false
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading || isProcessing || submitDisabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Vehicle"
        )}
      </Button>
    </div>
  );
}
