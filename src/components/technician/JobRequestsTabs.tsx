
import React from "react";
import { WashRequest } from "@/models/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { Button } from "@/components/ui/button";

interface JobRequestsTabsProps {
  pendingRequests: WashRequest[];
  assignedRequests: WashRequest[];
  onRequestClick: (id: string) => void;
  onStartWash: (id: string) => void;
}

export const JobRequestsTabs = ({
  pendingRequests,
  assignedRequests,
  onRequestClick,
  onStartWash
}: JobRequestsTabsProps) => {
  return (
    <>
      <h2 className="text-lg font-medium mb-3">Job Requests</h2>
      <Tabs defaultValue="available">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="available">Available ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({assignedRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="pt-4 space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(request => (
              <WashRequestCard
                key={request.id}
                washRequest={request}
                onClick={() => onRequestClick(request.id)}
              />
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No available job requests</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="pt-4 space-y-4">
          {assignedRequests.length > 0 ? (
            assignedRequests.map(request => (
              <WashRequestCard
                key={request.id}
                washRequest={request}
                onClick={() => onRequestClick(request.id)}
                actions={
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWash(request.id);
                    }}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    Start Wash
                  </Button>
                }
              />
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No upcoming jobs</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};
