
import React from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InProgressJobsProps {
  inProgressRequests: WashRequest[];
  onSelectJob: (requestId: string) => void;
  onReopenWash: (requestId: string) => void;
}

export const InProgressJobs = ({ 
  inProgressRequests,
  onSelectJob,
  onReopenWash 
}: InProgressJobsProps) => {
  if (inProgressRequests.length === 0) {
    return null;
  }
  
  return (
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
  );
};

// Get customer name based on ID
const getCustomerName = (customerId: string) => {
  if (customerId === "d5aaa3a4-b5a0-4485-b579-b868e0dd1d32") {
    return "ABC Denver";
  }
  return customerId;
};
