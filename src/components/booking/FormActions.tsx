
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface FormActionsProps {
  isSubmitting?: boolean;
  isValid?: boolean;
  onCancel: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function FormActions({
  isSubmitting = false,
  isValid = true,
  onCancel,
  primaryLabel = "Request Wash",
  secondaryLabel = "Cancel",
  onSecondaryAction
}: FormActionsProps) {
  const handleSecondaryAction = (e: React.MouseEvent) => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onCancel();
    }
  };
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSecondaryAction} 
        disabled={isSubmitting}
      >
        {secondaryLabel}
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            {primaryLabel}
          </>
        )}
      </Button>
    </div>
  );
}
