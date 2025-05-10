
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface FormActionsProps {
  isSubmitting?: boolean;
  isLoading?: boolean; // Added isLoading prop
  isValid?: boolean;
  onCancel: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export function FormActions({
  isSubmitting = false,
  isLoading = false, // Added isLoading with default value
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
  
  // Use either isSubmitting or isLoading
  const isProcessing = isSubmitting || isLoading;
  
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSecondaryAction} 
        disabled={isProcessing}
      >
        {secondaryLabel}
      </Button>
      <Button 
        type="submit" 
        disabled={isProcessing || !isValid}
      >
        {isProcessing ? (
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
