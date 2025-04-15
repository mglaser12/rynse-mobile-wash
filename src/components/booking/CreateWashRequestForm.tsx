
import React, { useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { useVehicles } from "@/contexts/VehicleContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VehicleSelectionSection } from "./VehicleSelectionSection";
import { DateSelectionSection } from "./DateSelectionSection";
import { NotesSection } from "./NotesSection";
import { PriceSummary } from "./PriceSummary";
import { FormActions } from "./FormActions";
import { useWashRequestForm } from "./useWashRequestForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { vehicles } = useVehicles();
  const isMobile = useIsMobile();
  const formRef = useRef<HTMLDivElement>(null);
  
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
    <div className="space-y-6 overflow-hidden flex flex-col h-full max-h-[80vh]">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash</h3>
        <p className="text-sm text-muted-foreground">
          Select your vehicles and preferred details for your mobile wash.
        </p>
      </div>
      
      <ScrollArea 
        className="flex-1 pr-4 -mr-4 overflow-y-auto" 
        scrollHideDelay={0}
      >
        <div ref={formRef} className="pb-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Vehicle Selection */}
              <div className="form-section">
                <VehicleSelectionSection 
                  vehicles={vehicles}
                  selectedVehicleIds={selectedVehicleIds}
                  onSelectVehicle={handleVehicleSelection}
                  onCancel={onCancel}
                />
              </div>

              <Separator />
              
              {/* Date Selection */}
              <div className="form-section">
                <DateSelectionSection 
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
              
              <Separator />
              
              {/* Additional Notes */}
              <div className="form-section">
                <NotesSection 
                  notes={notes}
                  onNotesChange={setNotes}
                />
              </div>
              
              <Separator />
              
              {/* Price Summary */}
              <div className="form-section">
                <PriceSummary vehicleCount={selectedVehicleIds.length} />
              </div>
              
              {/* Form Actions */}
              <FormActions 
                isLoading={isLoading} 
                isValid={isFormValid}
                onCancel={onCancel}
              />
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
}

