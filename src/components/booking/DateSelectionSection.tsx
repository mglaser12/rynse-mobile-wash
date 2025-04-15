
import React from "react";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { useIsMobile } from "@/hooks/use-mobile";

interface DateSelectionSectionProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  allowRange?: boolean;
}

export function DateSelectionSection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
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
    </div>
  );
}

