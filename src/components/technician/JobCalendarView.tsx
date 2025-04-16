
import React from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InProgressJobs } from "./calendar/InProgressJobs";
import { CalendarDisplay } from "./calendar/CalendarDisplay";
import { SelectedDateJobs } from "./calendar/SelectedDateJobs";
import { DateBadges } from "./calendar/DateBadges";
import { useCalendarData } from "./calendar/useCalendarData";

interface JobCalendarViewProps {
  assignedRequests: WashRequest[];
  inProgressRequests: WashRequest[];
  onSelectJob: (requestId: string) => void;
  onReopenWash: (requestId: string) => void;
}

export const JobCalendarView = ({ 
  assignedRequests, 
  inProgressRequests,
  onSelectJob,
  onReopenWash
}: JobCalendarViewProps) => {
  const {
    selectedDate,
    setSelectedDate,
    jobsByDate,
    selectedDateJobs,
    datesWithJobs
  } = useCalendarData(assignedRequests);
  
  // Force refresh of selectedDateJobs when date changes
  const handleSelectDate = (date: Date) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
  };
  
  return (
    <div className="space-y-8">
      {/* In Progress Jobs */}
      <InProgressJobs 
        inProgressRequests={inProgressRequests}
        onSelectJob={onSelectJob}
        onReopenWash={onReopenWash}
      />
      
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Job Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Calendar Component */}
            <CalendarDisplay 
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              datesWithJobs={datesWithJobs}
              jobsByDate={jobsByDate}
            />
            
            {/* Selected Date Jobs */}
            <SelectedDateJobs
              selectedDate={selectedDate}
              selectedDateJobs={selectedDateJobs}
              onSelectJob={onSelectJob}
            />
            
            {/* Date badges */}
            <DateBadges
              jobsByDate={jobsByDate}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
