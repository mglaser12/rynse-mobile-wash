
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarRange, RefreshCw } from "lucide-react";
import { useWashRequests } from "@/contexts/WashContext";

export const EmptySchedule = () => {
  const { refreshData } = useWashRequests();

  return (
    <div className="border border-dashed rounded-lg p-6 mt-3 text-center">
      <CalendarRange className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
      <h3 className="font-medium">No active jobs</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        It seems there are no wash requests assigned to you right now.
      </p>
      <div className="flex flex-col space-y-2">
        <Button 
          variant="outline" 
          onClick={refreshData}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Jobs
        </Button>
        <Button 
          variant="secondary"
          className="w-full"
        >
          View All Pending Requests
        </Button>
      </div>
    </div>
  );
};
