
import React from "react";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
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
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {Object.keys(jobsByDate).map(dateStr => {
        const date = new Date(dateStr);
        const jobCount = jobsByDate[dateStr].length;
        
        return (
          <Badge 
            key={dateStr}
            variant={isSameDay(date, selectedDate) ? "default" : "outline"}
            className="cursor-pointer"
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
