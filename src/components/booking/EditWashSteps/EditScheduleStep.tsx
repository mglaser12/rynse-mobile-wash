
import React from "react";
import { Separator } from "@/components/ui/separator";
import { DateSelectionSection } from "../DateSelectionSection";
import { RecurringSelectionSection } from "../RecurringSelectionSection";
import { NotesSection } from "../NotesSection";
import { PriceSummary } from "../PriceSummary";
import { FormActions } from "../FormActions";
import { RecurringFrequency } from "@/models/types";

interface EditScheduleStepProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  notes: string;
  recurringFrequency: RecurringFrequency;
  isLoading: boolean;
  selectedVehicleIds: string[];
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onRecurringFrequencyChange: (frequency: RecurringFrequency) => void;
  onNotesChange: (notes: string) => void;
  onCancel: () => void;
  isValid: boolean;
}

export function EditScheduleStep({
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
  isValid
}: EditScheduleStepProps) {
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
        isValid={isValid}
        onCancel={onCancel}
        submitText="Update Quote"
      />
    </>
  );
}
