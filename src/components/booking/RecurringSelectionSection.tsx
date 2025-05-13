
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RecurringFrequency } from "@/models/types";
import { Repeat } from "lucide-react";

interface RecurringSelectionSectionProps {
  selectedFrequency: RecurringFrequency;
  onSelectFrequency: (frequency: RecurringFrequency) => void;
}

export function RecurringSelectionSection({
  selectedFrequency,
  onSelectFrequency
}: RecurringSelectionSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <Repeat className="h-4 w-4 mr-2" />
        Recurring Schedule
      </Label>
      
      <RadioGroup 
        value={selectedFrequency} 
        onValueChange={(value) => onSelectFrequency(value as RecurringFrequency)}
        className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      >
        <div className="flex items-center space-x-2 border rounded-md p-2">
          <RadioGroupItem value="none" id="none" />
          <Label htmlFor="none" className="cursor-pointer">One-time</Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-2">
          <RadioGroupItem value="weekly" id="weekly" />
          <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-2">
          <RadioGroupItem value="biweekly" id="biweekly" />
          <Label htmlFor="biweekly" className="cursor-pointer">Bi-weekly</Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-2">
          <RadioGroupItem value="monthly" id="monthly" />
          <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-md p-2">
          <RadioGroupItem value="quarterly" id="quarterly" />
          <Label htmlFor="quarterly" className="cursor-pointer">Quarterly</Label>
        </div>
      </RadioGroup>
      
      <p className="text-xs text-muted-foreground">
        {selectedFrequency === "none" 
          ? "This is a one-time wash request." 
          : `Your wash will be scheduled to repeat ${selectedFrequency}.`}
      </p>
    </div>
  );
}
