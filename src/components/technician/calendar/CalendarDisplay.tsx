
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isPast, isToday } from "date-fns";

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
          hasJobs: datesWithJobs,
          past: (date) => isPast(date) && !isToday(date),
          today: (date) => isToday(date),
        }}
        modifiersStyles={{
          hasJobs: {
            position: 'relative'
          },
          past: {
            color: '#8E9196',
            opacity: 0.6
          },
          today: {
            fontWeight: 'bold',
            borderColor: '#1EAEDB',
            borderWidth: '2px',
          }
        }}
        components={{
          Day: (props) => {
            // Make sure we're safely accessing the date property
            if (!props || !props.date) return null;
            
            const date = props.date;
            const dateStr = format(date, "yyyy-MM-dd");
            const hasJobs = jobsByDate && jobsByDate[dateStr] && jobsByDate[dateStr].length > 0;
            const isPastDay = isPast(date) && !isToday(date);
            const isCurrentDay = isToday(date);
            const jobCount = jobsByDate && jobsByDate[dateStr] ? jobsByDate[dateStr].length : 0;
            
            return (
              <div 
                {...props} 
                className={`${props.className} ${hasJobs ? 'cursor-pointer' : ''} ${isPastDay ? 'text-gray-400' : ''} ${isCurrentDay ? 'font-bold' : ''}`}
              >
                {date.getDate()}
                {hasJobs && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {jobCount > 1 && (
                      <span className="text-[0.6rem] ml-0.5 absolute -right-3 -bottom-0.5 text-primary font-medium">
                        {jobCount}
                      </span>
                    )}
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
