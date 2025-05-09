
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  allowRange?: boolean;
  disabledDates?: (date: Date) => boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  allowRange = true,
  disabledDates
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (!allowRange || !startDate || (startDate && endDate)) {
      onStartDateChange(date);
      onEndDateChange(undefined);
    } else {
      // If start date is selected and end date is not selected, set end date
      if (date && date > startDate) {
        onEndDateChange(date);
        setIsOpen(false);
      } else {
        // If trying to select a date before start date, reset and set new start date
        onStartDateChange(date);
        onEndDateChange(undefined);
      }
    }
  };

  const displayText = () => {
    if (!startDate) return "Select date";
    
    if (!endDate) {
      return format(startDate, "MMM dd, yyyy");
    }
    
    return `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal",
            !startDate && "text-muted-foreground"
          )}
        >
          {displayText()}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {allowRange ? (
          <Calendar
            mode="range"
            selected={{
              from: startDate || undefined,
              to: endDate || undefined
            }}
            onSelect={(range) => {
              if (range?.from) {
                onStartDateChange(range.from);
                onEndDateChange(range.to);
              } else {
                onStartDateChange(undefined);
                onEndDateChange(undefined);
              }
            }}
            initialFocus
            disabled={disabledDates}
            className={cn("p-3 pointer-events-auto")}
          />
        ) : (
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleSelect}
            initialFocus
            disabled={disabledDates}
            className={cn("p-3 pointer-events-auto")}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
