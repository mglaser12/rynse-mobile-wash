
import React from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WashRequestCard } from "@/components/shared/WashRequestCard";

interface JobHistoryProps {
  completedJobs: WashRequest[];
  onViewJobDetails: (requestId: string) => void;
}

export const JobHistory = ({
  completedJobs = [],
  onViewJobDetails
}: JobHistoryProps) => {
  if (!completedJobs || completedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">
            No completed jobs found in your history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {completedJobs.map((job) => (
        <WashRequestCard
          key={job.id}
          washRequest={job}
          onClick={() => onViewJobDetails(job.id)}
          showDetailsButton
        />
      ))}
    </div>
  );
};
