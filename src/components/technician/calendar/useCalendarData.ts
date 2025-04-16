
import { useState, useMemo } from "react";
import { WashRequest } from "@/models/types";
import { format, isToday } from "date-fns";

export const useCalendarData = (assignedRequests: WashRequest[]) => {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    return today;
  });
  
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
  
  // Find if there are any jobs for today and set as selected if possible
  useMemo(() => {
    if (Object.keys(jobsByDate).length > 0) {
      // Check if there are jobs for today
      const today = new Date();
      const todayKey = format(today, "yyyy-MM-dd");
      
      if (jobsByDate[todayKey] && jobsByDate[todayKey].length > 0) {
        // If there are jobs today and no date is currently selected, select today
        if (!selectedDate || !isToday(selectedDate)) {
          setSelectedDate(today);
        }
      }
    }
  }, [jobsByDate, selectedDate]);
  
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
