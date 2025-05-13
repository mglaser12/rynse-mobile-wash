
import React from "react";
import { WashRequest } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FadeIn, ScaleIn, SlideUp, StaggeredChildren } from "@/components/ui/micro-animations";
import { useEditWashRequestForm } from "./hooks/useEditWashRequestForm";
import { EditLocationVehicleStep } from "./EditWashSteps/EditLocationVehicleStep";
import { EditServicesStep } from "./EditWashSteps/EditServicesStep";
import { EditScheduleStep } from "./EditWashSteps/EditScheduleStep";
import { StepIndicator } from "./steps/StepIndicator";
import { StepNavigation } from "./steps/StepNavigation";

interface EditWashRequestFormProps {
  washRequest: WashRequest;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditWashRequestForm({ washRequest, onSuccess, onCancel }: EditWashRequestFormProps) {
  const { vehicles } = useVehicles();
  const { 
    locations,
    filteredVehicles,
    selectedLocationId,
    selectedVehicleIds,
    vehicleServices,
    startDate,
    endDate,
    notes,
    selectedFrequency,
    isLoading,
    formRef,
    currentStep,
    handleNext,
    handlePrevious,
    isCurrentStepValid,
    steps,
    setSelectedLocationId,
    handleVehicleSelection,
    setVehicleServices,
    setStartDate,
    setEndDate,
    setSelectedFrequency,
    setNotes,
    handleSubmit
  } = useEditWashRequestForm(washRequest, vehicles, () => {
    toast.success("Wash request updated successfully");
    onSuccess();
  });

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <EditLocationVehicleStep 
            locations={locations}
            filteredVehicles={filteredVehicles}
            selectedLocationId={selectedLocationId}
            selectedVehicleIds={selectedVehicleIds}
            onLocationChange={setSelectedLocationId}
            onVehicleSelection={handleVehicleSelection}
            onCancel={onCancel}
          />
        );
      case 1:
        return (
          <EditServicesStep 
            filteredVehicles={filteredVehicles}
            selectedVehicleIds={selectedVehicleIds}
            vehicleServices={vehicleServices}
            onServiceChange={setVehicleServices}
          />
        );
      case 2:
        return (
          <EditScheduleStep
            startDate={startDate}
            endDate={endDate}
            notes={notes}
            recurringFrequency={selectedFrequency}
            isLoading={isLoading}
            selectedVehicleIds={selectedVehicleIds}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onRecurringFrequencyChange={setSelectedFrequency}
            onNotesChange={setNotes}
            onCancel={onCancel}
            isValid={isCurrentStepValid()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full max-h-[80vh]">
      <ScaleIn>
        <div>
          <h2 className="text-lg font-semibold mb-4">Edit Wash Request</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You can modify your wash request details below.
          </p>
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </ScaleIn>
      
      <ScrollArea 
        className="flex-1 pr-4 -mr-4 overflow-y-auto" 
        scrollHideDelay={0}
      >
        <div ref={formRef} className="pb-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <StaggeredChildren staggerMs={150}>
                <SlideUp>
                  {renderStepContent()}
                </SlideUp>
                
                {currentStep !== 2 && (
                  <StepNavigation 
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isNextDisabled={!isCurrentStepValid()}
                  />
                )}
              </StaggeredChildren>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}
