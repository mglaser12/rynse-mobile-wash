
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface CalendarDisplayProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
  datesWithJobs: Date[];
  jobsByDate: Record<string, any[]>;
}

export const CalendarDisplay = ({ 
  selectedDate, 
  onSelectDate, 
  datesWithJobs,
  jobsByDate 
}: CalendarDisplayProps) => {
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onSelectDate(date)}
        className="rounded-md border p-3"
        modifiers={{
          hasJobs: datesWithJobs
        }}
        modifiersStyles={{
          hasJobs: {
            position: 'relative'
          }
        }}
        components={{
          Day: ({ date, ...props }) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const hasJobs = jobsByDate[dateStr] && jobsByDate[dateStr].length > 0;
            
            return (
              <div {...props}>
                {date.getDate()}
                {hasJobs && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                )}
              </div>
            );
          }
        }}
      />
    </div>
  );
};
