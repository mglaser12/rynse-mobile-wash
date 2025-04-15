
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface JobCalendarViewProps {
  assignedRequests: WashRequest[];
  onSelectJob: (requestId: string) => void;
}

export const JobCalendarView = ({ assignedRequests, onSelectJob }: JobCalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Create a map of dates with jobs
  const jobDates = assignedRequests.reduce((acc, job) => {
    const dateStr = format(job.preferredDates.start, "yyyy-MM-dd");
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(job);
    return acc;
  }, {} as Record<string, WashRequest[]>);
  
  // Function to render job count badges on calendar days
  const renderJobsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const jobs = jobDates[dateStr];
    
    if (!jobs || jobs.length === 0) {
      return null;
    }
    
    return (
      <div className="absolute bottom-0 right-0 transform translate-x-1/3 translate-y-1/3">
        <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {jobs.length}
        </Badge>
      </div>
    );
  };
  
  // Find jobs for the selected date
  const selectedDateJobs = selectedDate 
    ? jobDates[format(selectedDate, "yyyy-MM-dd")] || []
    : [];
    
  // Get customer name based on ID
  const getCustomerName = (customerId: string) => {
    if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
      return "ABC Denver";
    }
    return customerId;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: (props) => (
                    <div className="relative w-full h-full">
                      {props.day}
                      {renderJobsForDay(props.date)}
                    </div>
                  ),
                }}
              />
            </div>

            <div className="w-full md:w-1/2">
              <h3 className="text-lg font-medium mb-4">
                {selectedDate ? (
                  <span className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Jobs for {format(selectedDate, "MMMM d, yyyy")}
                  </span>
                ) : (
                  "Select a date to view jobs"
                )}
              </h3>
              
              {selectedDateJobs.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateJobs.map((job) => (
                    <Card 
                      key={job.id} 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => onSelectJob(job.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{getCustomerName(job.customerId)}</p>
                            <p className="text-sm text-muted-foreground">
                              {job.vehicles.length} vehicle{job.vehicles.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${job.price.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(job.preferredDates.start, "h:mm a")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedDate ? "No jobs scheduled for this day" : "Select a date to view scheduled jobs"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
