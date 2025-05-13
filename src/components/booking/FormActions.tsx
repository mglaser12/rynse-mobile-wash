
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { RippleEffect } from "@/components/ui/micro-animations";

interface FormActionsProps {
  isLoading: boolean;
  isValid: boolean;
  onCancel: () => void;
  submitText?: string;
}

export function FormActions({ isLoading, isValid, onCancel, submitText = "Request Quote" }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={isLoading}
        className="relative overflow-hidden transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
      >
        Cancel
        <RippleEffect />
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || !isValid}
        className="relative overflow-hidden transition-all hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] active:shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            {submitText}
          </>
        )}
        <RippleEffect />
      </Button>
    </div>
  );
}
