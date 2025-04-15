
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

interface FormActionsProps {
  isLoading: boolean;
  isValid: boolean;
  onCancel: () => void;
}

export function FormActions({ isLoading, isValid, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
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
        disabled={isLoading || !isValid}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Request Wash
          </>
        )}
      </Button>
    </div>
  );
}
