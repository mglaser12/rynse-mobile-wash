
import React from "react";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay, isPast, isToday } from "date-fns";
import { WashRequest } from "@/models/types";

interface DateBadgesProps {
  jobsByDate: Record<string, WashRequest[]>;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const DateBadges = ({
  jobsByDate,
  selectedDate,
  onSelectDate
}: DateBadgesProps) => {
  const sortedDates = Object.keys(jobsByDate)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
    
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {sortedDates.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const jobCount = jobsByDate[dateStr].length;
        const isPastDate = isPast(date) && !isToday(date);
        const isCurrentDay = isToday(date);
        
        return (
          <Badge 
            key={dateStr}
            variant={isSameDay(date, selectedDate) ? "default" : "outline"}
            className={`cursor-pointer ${isPastDate ? 'opacity-70' : ''} ${isCurrentDay ? 'border-primary' : ''}`}
            onClick={() => onSelectDate(date)}
          >
            {format(date, "MMM d")}
            <span className="ml-1 text-xs">
              ({jobCount})
            </span>
          </Badge>
        );
      })}
    </div>
  );
};
