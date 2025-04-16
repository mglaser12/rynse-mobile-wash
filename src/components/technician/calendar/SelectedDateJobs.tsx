
import React from "react";
import { format } from "date-fns";
import { WashRequest } from "@/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface SelectedDateJobsProps {
  selectedDate: Date;
  selectedDateJobs: WashRequest[];
  onSelectJob: (requestId: string) => void;
}

export const SelectedDateJobs = ({
  selectedDate,
  selectedDateJobs,
  onSelectJob
}: SelectedDateJobsProps) => {
  return (
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
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
            <Calendar className="h-10 w-10 text-gray-400 mb-3" />
            <p>No jobs scheduled for this day</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Get customer name based on ID
const getCustomerName = (customerId: string) => {
  if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
    return "ABC Denver";
  }
  return customerId;
};
