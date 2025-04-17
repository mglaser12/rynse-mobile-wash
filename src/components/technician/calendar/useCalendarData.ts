
import { useState, useMemo, useEffect, useRef } from "react";
import { WashRequest } from "@/models/types";
import { format, isSameDay, isToday, parseISO } from "date-fns";

export const useCalendarData = (assignedRequests: WashRequest[]) => {
  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    return today;
  });
  
  // Track if we've already set the initial date
  const initialDateSetRef = useRef(false);
  
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
    if (initialDateSetRef.current) {
      // We've already set the initial date, so don't override user selection
      console.log("Initial date already set, preserving user selection:", selectedDate);
      return;
    }
    
    const today = new Date();
    const todayKey = format(today, "yyyy-MM-dd");
    
    if (jobsByDate[todayKey] && jobsByDate[todayKey].length > 0) {
      console.log("Setting initial date to today with jobs");
      setSelectedDate(today);
    } else {
      // If no jobs today, try to find the first date with jobs
      const firstDateWithJobs = Object.keys(jobsByDate).sort()[0];
      if (firstDateWithJobs) {
        console.log("Setting initial date to first date with jobs:", firstDateWithJobs);
        setSelectedDate(new Date(firstDateWithJobs));
      }
    }
    
    // Mark that we've set the initial date
    initialDateSetRef.current = true;
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
