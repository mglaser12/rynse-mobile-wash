
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WashRequestCard } from "@/components/shared/WashRequestCard";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CalendarRange, CheckCircle, Calendar } from "lucide-react";

const TechnicianHome = () => {
  const { user } = useAuth();
  const { washRequests, isLoading, updateWashRequest } = useWashRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filter wash requests relevant to this technician
  const pendingRequests = washRequests.filter(req => req.status === "pending");
  const assignedRequests = washRequests.filter(req => 
    req.status === "confirmed" && req.technician === user?.id
  );
  const inProgressRequests = washRequests.filter(req => 
    req.status === "in_progress" && req.technician === user?.id
  );
  
  const selectedRequest = selectedRequestId 
    ? washRequests.find(req => req.id === selectedRequestId) 
    : null;
  
  const handleAcceptRequest = async (requestId: string) => {
    setIsUpdating(true);
    try {
      await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user?.id,
      });
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };
  
  const handleStartWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      await updateWashRequest(requestId, {
        status: "in_progress",
      });
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };
  
  const handleCompleteWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      await updateWashRequest(requestId, {
        status: "completed",
      });
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Technician Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-brand-primary" />
                Today's Schedule
              </h2>
              
              {inProgressRequests.length > 0 ? (
                <div className="mt-3 space-y-4">
                  {inProgressRequests.map(request => (
                    <WashRequestCard
                      key={request.id}
                      washRequest={request}
                      onClick={() => setSelectedRequestId(request.id)}
                      actions={
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteWash(request.id);
                          }}
                          className="w-full mt-2"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      }
                    />
                  ))}
                </div>
              ) : assignedRequests.length > 0 ? (
                <div className="mt-3 space-y-4">
                  {assignedRequests.map(request => (
                    <WashRequestCard
                      key={request.id}
                      washRequest={request}
                      onClick={() => setSelectedRequestId(request.id)}
                      actions={
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWash(request.id);
                          }}
                          className="w-full mt-2"
                        >
                          Start Wash
                        </Button>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-6 mt-3 text-center">
                  <CalendarRange className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
                  <h3 className="font-medium">No active jobs</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    You don't have any active jobs at the moment
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {}}
                    className="mx-auto"
                  >
                    View Available Jobs
                  </Button>
                </div>
              )}
            </div>
            
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
                      onClick={() => setSelectedRequestId(request.id)}
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
                      onClick={() => setSelectedRequestId(request.id)}
                      actions={
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartWash(request.id);
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
        )}
      </div>
      
      {/* Detail Dialog */}
      <Dialog open={!!selectedRequestId} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Wash Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <WashRequestCard washRequest={selectedRequest} />
              
              {/* Actions based on status */}
              {selectedRequest.status === "pending" && (
                <Button 
                  className="w-full" 
                  onClick={() => handleAcceptRequest(selectedRequest.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Accept Job
                </Button>
              )}
              
              {selectedRequest.status === "confirmed" && selectedRequest.technician === user?.id && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStartWash(selectedRequest.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Start Wash
                </Button>
              )}
              
              {selectedRequest.status === "in_progress" && selectedRequest.technician === user?.id && (
                <Button 
                  className="w-full" 
                  onClick={() => handleCompleteWash(selectedRequest.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Complete Wash
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TechnicianHome;
