
import React from "react";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowRight } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateSelectionSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onContinue?: () => void;
  allowRange?: boolean;
}

export function DateSelectionSection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onContinue,
  allowRange = true
}: DateSelectionSectionProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <Calendar className="h-4 w-4 mr-2" />
        Preferred Date
      </Label>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        allowRange={allowRange}
      />
      <p className="text-xs text-muted-foreground">
        Select a single date or a range of dates for your wash.
      </p>
      
      {isMobile && onContinue && startDate && (
        <div className="mt-4">
          <Button 
            type="button" 
            className="w-full" 
            onClick={onContinue}
          >
            Continue to Notes
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
