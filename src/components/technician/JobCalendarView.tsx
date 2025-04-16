
import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Group jobs by date with null check on assignedRequests
  const jobsByDate = React.useMemo(() => {
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
  
  // Custom function to modify the calendar day rendering
  const modifyDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const hasJobs = jobsByDate[dateStr] && jobsByDate[dateStr].length > 0;
    
    if (hasJobs) {
      return (
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="absolute bottom-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        </div>
      );
    }
    
    return <div className="h-full w-full" />;
  };
  
  // Get customer name based on ID
  const getCustomerName = (customerId: string) => {
    if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
      return "ABC Denver";
    }
    return customerId;
  };

  return (
    <div className="space-y-8">
      {/* In Progress Jobs */}
      {inProgressRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-yellow-500" />
              In Progress Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inProgressRequests.map((job) => (
                <Card 
                  key={job.id} 
                  className="cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-l-yellow-500"
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex-1" onClick={() => onSelectJob(job.id)}>
                      <p className="font-medium">{getCustomerName(job.customerId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.vehicles.length} vehicle{job.vehicles.length !== 1 && "s"} • In progress
                      </p>
                    </div>
                    <Button 
                      variant="secondary" 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReopenWash(job.id);
                      }}
                    >
                      Continue Wash
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Job Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border p-3"
                components={{
                  Day: ({ date, ...props }) => (
                    <div
                      {...props}
                      className={`${props.className} relative`}
                    >
                      {date.getDate()}
                      {format(date, "yyyy-MM-dd") in jobsByDate && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ),
                }}
              />
            </div>
            
            {/* Selected Date Jobs */}
            <div>
              <h3 className="font-medium mb-3">
                Jobs for {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <div className="space-y-4">
                {selectedDateJobs.length > 0 ? (
                  selectedDateJobs.map((job) => (
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
                              {job.vehicles.length} vehicle{job.vehicles.length !== 1 && "s"}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs scheduled for this day
                  </div>
                )}
              </div>
            </div>
            
            {/* Date badges shown below calendar for context */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {Object.keys(jobsByDate).map(dateStr => {
                const date = new Date(dateStr);
                const jobCount = jobsByDate[dateStr].length;
                
                return (
                  <Badge 
                    key={dateStr}
                    variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedDate(date)}
                  >
                    {format(date, "MMM d")}
                    <span className="ml-1 text-xs">
                      ({jobCount})
                    </span>
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
