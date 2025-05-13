
import { useState, useRef, RefObject } from "react";

export type FormStep = {
  key: string;
  label: string;
  isValid: boolean;
};

interface UseFormStepsProps {
  steps: FormStep[];
  onStepChange?: (stepIndex: number) => void;
}

export function useFormSteps({ steps, onStepChange }: UseFormStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Scroll to top of form when changing steps
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
      
      if (onStepChange) {
        onStepChange(nextStep);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Scroll to top of form when changing steps
      if (formRef.current) {
        formRef.current.scrollTop = 0;
      }
      
      if (onStepChange) {
        onStepChange(prevStep);
      }
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = () => {
    return steps[currentStep]?.isValid || false;
  };

  return {
    currentStep,
    formRef,
    handleNext,
    handlePrevious,
    isCurrentStepValid,
    totalSteps: steps.length
  };
}
