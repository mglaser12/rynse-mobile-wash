
import { useState, useMemo, useEffect } from "react";
import { WashRequest } from "@/models/types";
import { format, isSameDay, isToday, parseISO } from "date-fns";

export const useCalendarData = (assignedRequests: WashRequest[]) => {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    return today;
  });
  
  // Group jobs by date with null check on assignedRequests
  const jobsByDate = useMemo(() => {
    if (!assignedRequests || !Array.isArray(assignedRequests)) {
      return {};
    }
    
    return assignedRequests.reduce((acc, job) => {
      if (!job.preferredDates || !job.preferredDates.start) return acc;
      
      // Ensure we're working with a Date object
      const startDate = job.preferredDates.start instanceof Date 
        ? job.preferredDates.start 
        : new Date(job.preferredDates.start);
      
      const dateKey = format(startDate, "yyyy-MM-dd");
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(job);
      return acc;
    }, {} as Record<string, WashRequest[]>);
  }, [assignedRequests]);
  
  // Find if there are any jobs for today and set as selected if possible
  // Only do this on initial load, not every time the date changes
  useEffect(() => {
    // Only run this once on initial mount
    const today = new Date();
    const todayKey = format(today, "yyyy-MM-dd");
    
    if (jobsByDate[todayKey] && jobsByDate[todayKey].length > 0) {
      setSelectedDate(today);
    } else {
      // If no jobs today, try to find the first date with jobs
      const firstDateWithJobs = Object.keys(jobsByDate).sort()[0];
      if (firstDateWithJobs) {
        setSelectedDate(new Date(firstDateWithJobs));
      }
    }
  }, [jobsByDate]); // Only depend on jobsByDate, not selectedDate
  
  // Get jobs for selected date
  const selectedDateJobs = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    console.log("Looking for jobs on date:", dateKey, "Jobs by date:", jobsByDate);
    return jobsByDate[dateKey] || [];
  }, [selectedDate, jobsByDate]);
  
  // Get dates with jobs for calendar highlighting
  const datesWithJobs = useMemo(() => {
    return Object.keys(jobsByDate)
      .map(dateStr => new Date(dateStr));
  }, [jobsByDate]);
    
  return {
    selectedDate,
    setSelectedDate,
    jobsByDate,
    selectedDateJobs,
    datesWithJobs
  };
};
