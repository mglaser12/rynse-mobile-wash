
import React from "react";
import { FormStep } from "../hooks/useFormSteps";

interface StepIndicatorProps {
  steps: { key: string; label: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          {index > 0 && <div className="h-0.5 w-8 bg-muted-foreground/30" />}
          <div 
            className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium 
              ${index === currentStep ? 'bg-primary text-primary-foreground' : 
               index < currentStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            {index + 1}
          </div>
          <div className="text-sm font-medium">
            {step.label}
          </div>
          {index < steps.length - 1 && <div className="h-0.5 w-8 bg-muted-foreground/30" />}
        </React.Fragment>
      ))}
    </div>
  );
}
