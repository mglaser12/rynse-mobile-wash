
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { JobHistory } from "@/components/technician/JobHistory";
import { WashRequest } from "@/models/types";

interface TechnicianTabsProps {
  pendingRequests: WashRequest[];
  assignedRequests: WashRequest[];
  completedRequests: WashRequest[];
  onRequestClick: (id: string) => void;
  onStartWash: (id: string) => void;
  onViewJobDetails: (id: string) => void;
}

export const TechnicianTabs = ({
  pendingRequests,
  assignedRequests,
  completedRequests,
  onRequestClick,
  onStartWash,
  onViewJobDetails
}: TechnicianTabsProps) => {
  return (
    <Tabs defaultValue="jobs" className="mt-6">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="jobs">Current Jobs</TabsTrigger>
        <TabsTrigger value="history">Job History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="jobs" className="pt-4">
        <JobRequestsTabs
          pendingRequests={pendingRequests}
          assignedRequests={assignedRequests}
          onRequestClick={onRequestClick}
          onStartWash={onStartWash}
        />
      </TabsContent>
      
      <TabsContent value="history" className="pt-4">
        <JobHistory 
          completedJobs={completedRequests} 
          onViewJobDetails={onViewJobDetails} 
        />
      </TabsContent>
    </Tabs>
  );
};
