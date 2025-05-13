
import React from "react";
import { Separator } from "@/components/ui/separator";
import { DateSelectionSection } from "../DateSelectionSection";
import { RecurringSelectionSection } from "../RecurringSelectionSection";
import { NotesSection } from "../NotesSection";
import { PriceSummary } from "../PriceSummary";
import { FormActions } from "../FormActions";
import { RecurringFrequency } from "@/models/types";

interface ScheduleStepProps {
  startDate?: Date;
  endDate?: Date;
  notes: string;
  recurringFrequency: RecurringFrequency;
  isLoading: boolean;
  selectedVehicleIds: string[];
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onRecurringFrequencyChange: (frequency: RecurringFrequency) => void;
  onNotesChange: (notes: string) => void;
  onCancel: () => void;
  isStepValid: boolean;
}

export function ScheduleStep({
  startDate,
  endDate,
  notes,
  recurringFrequency,
  isLoading,
  selectedVehicleIds,
  onStartDateChange,
  onEndDateChange,
  onRecurringFrequencyChange,
  onNotesChange,
  onCancel,
  isStepValid
}: ScheduleStepProps) {
  return (
    <>
      <div className="form-section">
        <DateSelectionSection 
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>
        
      <Separator className="my-4" />
        
      <div className="form-section">
        <RecurringSelectionSection
          selectedFrequency={recurringFrequency}
          onSelectFrequency={onRecurringFrequencyChange}
        />
      </div>
        
      <Separator className="my-4" />
        
      <div className="form-section">
        <NotesSection 
          notes={notes}
          onNotesChange={onNotesChange}
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="form-section">
        <PriceSummary 
          vehicleCount={selectedVehicleIds.length} 
          recurringFrequency={recurringFrequency}
        />
      </div>
      
      <Separator className="my-4" />
      
      <FormActions 
        isLoading={isLoading} 
        isValid={isStepValid}
        onCancel={onCancel}
      />
    </>
  );
}
