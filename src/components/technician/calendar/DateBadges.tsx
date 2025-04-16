
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
  if (!jobsByDate) return null;

  const sortedDates = Object.keys(jobsByDate)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
    
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {sortedDates.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const jobs = jobsByDate[dateStr];
        // Make sure jobs exist before accessing length and only show badges for dates with jobs
        const jobCount = jobs ? jobs.length : 0;
        
        // Skip rendering badges for dates with no jobs
        if (jobCount === 0) return null;
        
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
