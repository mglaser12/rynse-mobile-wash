
import React, { useState } from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobCalendarViewProps {
  assignedRequests: WashRequest[];
  onSelectJob: (requestId: string) => void;
}

export const JobCalendarView = ({ assignedRequests, onSelectJob }: JobCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Group jobs by date with null check on assignedRequests
  const jobsByDate = (assignedRequests || []).reduce((acc, job) => {
    const dateKey = format(job.preferredDates.start, "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(job);
    return acc;
  }, {} as Record<string, WashRequest[]>);
  
  // Get unique dates with jobs
  const datesWithJobs = Object.keys(jobsByDate)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());
  
  // Get jobs for current date
  const currentDateJobs = jobsByDate[format(currentDate, "yyyy-MM-dd")] || [];
  
  // Navigate to previous/next date with jobs
  const goToPreviousDate = () => {
    const prevDates = datesWithJobs.filter(date => date < currentDate);
    if (prevDates.length > 0) {
      setCurrentDate(prevDates[prevDates.length - 1]);
    }
  };
  
  const goToNextDate = () => {
    const nextDates = datesWithJobs.filter(date => date > currentDate);
    if (nextDates.length > 0) {
      setCurrentDate(nextDates[0]);
    }
  };
  
  // Get customer name based on ID
  const getCustomerName = (customerId: string) => {
    if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
      return "ABC Denver";
    }
    return customerId;
  };
  
  // Check if the current date has any jobs
  const hasJobsToday = jobsByDate[format(new Date(), "yyyy-MM-dd")] !== undefined;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Job Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousDate}
                disabled={!datesWithJobs.some(date => date < currentDate)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                <span className="font-medium">
                  {format(currentDate, "MMMM d, yyyy")}
                </span>
                {isSameDay(currentDate, new Date()) && (
                  <Badge variant="secondary">Today</Badge>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextDate}
                disabled={!datesWithJobs.some(date => date > currentDate)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Job List */}
            <div className="space-y-4">
              {currentDateJobs.length > 0 ? (
                currentDateJobs.map((job) => (
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
            
            {/* Quick Navigation to Today */}
            {!isSameDay(currentDate, new Date()) && hasJobsToday && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Go to Today's Jobs
                </Button>
              </div>
            )}
            
            {/* Date List */}
            <div className="flex flex-wrap gap-2 justify-center">
              {datesWithJobs.map(date => {
                // Make sure jobsByDate[format(date, "yyyy-MM-dd")] exists before accessing its length
                const dateKey = format(date, "yyyy-MM-dd");
                const jobsForDate = jobsByDate[dateKey] || [];
                
                return (
                  <Badge 
                    key={dateKey}
                    variant={isSameDay(date, currentDate) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCurrentDate(date)}
                  >
                    {format(date, "MMM d")}
                    <span className="ml-1 text-xs">
                      ({jobsForDate.length})
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
