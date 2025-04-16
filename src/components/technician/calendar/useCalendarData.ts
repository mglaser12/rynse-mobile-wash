
import { useState, useMemo } from "react";
import { WashRequest } from "@/models/types";
import { format } from "date-fns";

export const useCalendarData = (assignedRequests: WashRequest[]) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Group jobs by date with null check on assignedRequests
  const jobsByDate = useMemo(() => {
    return (assignedRequests || []).reduce((acc, job) => {
      const dateKey = format(job.preferredDates.start, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(job);
      return acc;
    }, {} as Record<string, WashRequest[]>);
  }, [assignedRequests]);
  
  // Get jobs for selected date
  const selectedDateJobs = jobsByDate[format(selectedDate, "yyyy-MM-dd")] || [];
  
  // Get dates with jobs for calendar highlighting
  const datesWithJobs = Object.keys(jobsByDate)
    .map(dateStr => new Date(dateStr));
    
  return {
    selectedDate,
    setSelectedDate,
    jobsByDate,
    selectedDateJobs,
    datesWithJobs
  };
};
