
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { JobHistory } from "@/components/technician/JobHistory";
import { JobCalendarView } from "@/components/technician/JobCalendarView";
import { WashRequest } from "@/models/types";
import { CalendarDays, ListTodo, History } from "lucide-react";

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
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="jobs" className="flex items-center gap-2">
          <ListTodo className="h-4 w-4" />
          <span className="hidden sm:inline">Current Jobs</span>
          <span className="sm:hidden">Jobs</span>
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Calendar</span>
          <span className="sm:hidden">Calendar</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">Job History</span>
          <span className="sm:hidden">History</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="jobs" className="pt-4">
        <JobRequestsTabs
          pendingRequests={pendingRequests}
          assignedRequests={assignedRequests}
          onRequestClick={onRequestClick}
          onStartWash={onStartWash}
        />
      </TabsContent>
      
      <TabsContent value="calendar" className="pt-4">
        <JobCalendarView 
          assignedRequests={assignedRequests} 
          onSelectJob={onRequestClick} 
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
