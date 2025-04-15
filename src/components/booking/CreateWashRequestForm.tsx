
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useVehicles } from "@/contexts/VehicleContext";
import { useWashRequests } from "@/contexts/WashContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VehicleSelectionSection } from "./VehicleSelectionSection";
import { DateSelectionSection } from "./DateSelectionSection";
import { NotesSection } from "./NotesSection";
import { PriceSummary } from "./PriceSummary";
import { FormActions } from "./FormActions";
import { useWashRequestForm } from "./useWashRequestForm";

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { vehicles } = useVehicles();
  
  const { 
    isLoading,
    selectedVehicleIds,
    startDate,
    endDate,
    notes,
    isFormValid,
    setNotes,
    setStartDate,
    setEndDate,
    handleVehicleSelection,
    handleSubmit
  } = useWashRequestForm(onSuccess);

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash</h3>
        <p className="text-sm text-muted-foreground">
          Select your vehicles and preferred details for your mobile wash.
        </p>
      </div>
      
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Vehicle Selection */}
            <VehicleSelectionSection 
              vehicles={vehicles}
              selectedVehicleIds={selectedVehicleIds}
              onSelectVehicle={handleVehicleSelection}
              onCancel={onCancel}
            />

            <Separator />
            
            {/* Date Selection */}
            <DateSelectionSection 
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            
            {/* Additional Notes */}
            <NotesSection 
              notes={notes}
              onNotesChange={setNotes}
            />
            
            {/* Price Summary */}
            <PriceSummary vehicleCount={selectedVehicleIds.length} />
            
            {/* Form Actions */}
            <FormActions 
              isLoading={isLoading} 
              isValid={isFormValid}
              onCancel={onCancel}
            />
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
