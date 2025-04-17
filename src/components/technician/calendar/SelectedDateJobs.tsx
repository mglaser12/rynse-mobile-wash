
import React from "react";
import { format } from "date-fns";
import { WashRequest } from "@/models/types";
import { Card } from "@/components/ui/card";
import { WashRequestCard } from "@/components/shared/WashRequestCard";

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
            <WashRequestCard 
              key={job.id} 
              washRequest={job}
              onClick={() => onSelectJob(job.id)}
            />
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            No jobs scheduled for this day
          </Card>
        )}
      </div>
    </div>
  );
};
