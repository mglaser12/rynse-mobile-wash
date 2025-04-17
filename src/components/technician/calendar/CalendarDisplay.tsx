
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isPast, isToday } from "date-fns";
import { WashRequest } from "@/models/types";

interface CalendarDisplayProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
  datesWithJobs: Date[];
  jobsByDate: Record<string, WashRequest[]>;
}

export const CalendarDisplay = ({ 
  selectedDate, 
  onSelectDate, 
  datesWithJobs,
  jobsByDate 
}: CalendarDisplayProps) => {
  // Explicitly log when a date is selected to debug
  const handleDateSelect = (date: Date | undefined) => {
    console.log("Calendar date selected:", date);
    if (date) {
      onSelectDate(date);
    }
  };
  
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border p-3 pointer-events-auto"
        modifiers={{
          hasJobs: datesWithJobs,
          past: (date) => isPast(date) && !isToday(date),
          today: (date) => isToday(date),
          selected: (date) => isSameDay(date, selectedDate),
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
          },
          selected: {
            fontWeight: 'bold',
            backgroundColor: '#9b87f5',
            color: 'white',
          }
        }}
        components={{
          Day: (props: any) => {
            if (!props || !props.date) return null;
            
            const date = props.date;
            const dateStr = format(date, "yyyy-MM-dd");
            const hasJobs = jobsByDate && jobsByDate[dateStr] && jobsByDate[dateStr].length > 0;
            const jobCount = jobsByDate && jobsByDate[dateStr] ? jobsByDate[dateStr].length : 0;
            const isPastDay = isPast(date) && !isToday(date);
            const isSelectedDay = isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            
            // Enhance clickability for days with jobs
            const handleDayClick = (e: React.MouseEvent) => {
              e.stopPropagation(); // Prevent event bubbling
              console.log("Day element clicked:", date);
              if (hasJobs) {
                onSelectDate(date);
              }
            };
            
            return (
              <div 
                {...props} 
                onClick={handleDayClick}
                className={`${props.className} ${hasJobs ? 'cursor-pointer hover:bg-gray-100' : ''} 
                  ${isPastDay ? 'text-gray-400' : ''} 
                  ${isCurrentDay ? 'font-bold border-2 border-primary' : ''} 
                  ${isSelectedDay ? 'font-bold bg-primary text-white hover:bg-primary hover:text-white' : ''}`}
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
