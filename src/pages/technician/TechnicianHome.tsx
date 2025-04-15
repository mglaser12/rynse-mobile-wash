
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { TechnicianHeader } from "@/components/technician/TechnicianHeader";
import { TodaySchedule } from "@/components/technician/TodaySchedule";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VehicleWashProgressDialog } from "@/components/technician/VehicleWashProgressDialog";

const TechnicianHome = () => {
  const { user } = useAuth();
  const { washRequests = [], isLoading, updateWashRequest, refreshData } = useWashRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [activeWashId, setActiveWashId] = useState<string | null>(null);
  
  // Safely filter wash requests (defensive programming)
  const pendingRequests = Array.isArray(washRequests) 
    ? washRequests.filter(req => req.status === "pending")
    : [];
    
  const assignedRequests = Array.isArray(washRequests) 
    ? washRequests.filter(req => req.status === "confirmed" && req.technician === user?.id)
    : [];
    
  const inProgressRequests = Array.isArray(washRequests) 
    ? washRequests.filter(req => req.status === "in_progress" && req.technician === user?.id)
    : [];
  
  const selectedRequest = selectedRequestId && Array.isArray(washRequests)
    ? washRequests.find(req => req.id === selectedRequestId) 
    : null;

  const activeWashRequest = activeWashId && Array.isArray(washRequests)
    ? washRequests.find(req => req.id === activeWashId)
    : null;
  
  const handleAcceptRequest = async (requestId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user?.id,
      });
      
      if (result) {
        toast.success("Request accepted successfully");
        refreshData(); // Refresh data after accepting a request
      } else {
        toast.error("Failed to accept request");
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("An error occurred while accepting the request");
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };
  
  const handleStartWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateWashRequest(requestId, {
        status: "in_progress",
      });
      
      if (result) {
        toast.success("Wash started successfully");
        refreshData(); // Refresh data after starting a wash
        
        // Open the wash progress dialog
        setActiveWashId(requestId);
      } else {
        toast.error("Failed to start wash");
      }
    } catch (error) {
      console.error("Error starting wash:", error);
      toast.error("An error occurred while starting the wash");
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };
  
  const handleCompleteWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateWashRequest(requestId, {
        status: "completed",
      });
      
      if (result) {
        toast.success("Wash completed successfully");
        refreshData(); // Refresh data after completing a wash
        
        // Clear any active wash dialog
        if (activeWashId === requestId) {
          setActiveWashId(null);
        }
      } else {
        toast.error("Failed to complete wash");
      }
    } catch (error) {
      console.error("Error completing wash:", error);
      toast.error("An error occurred while completing the wash");
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };

  const handleWashProgressComplete = async () => {
    if (activeWashId) {
      await handleCompleteWash(activeWashId);
    }
  };
  
  // Toggle debug mode
  const toggleDebugMode = () => {
    setIsDebugMode(!isDebugMode);
  };

  return (
    <AppLayout>
      <TechnicianHeader userName={user?.name} />
      
      <div className="car-wash-container animate-fade-in p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            {/* Debug information about requests */}
            {isDebugMode && (
              <div className="bg-gray-100 p-4 mb-6 rounded-lg text-xs overflow-auto max-h-48">
                <h3 className="font-bold mb-2">Debug Information:</h3>
                <p>Pending requests: {pendingRequests.length}</p>
                <p>Assigned requests: {assignedRequests.length}</p>
                <p>In-progress requests: {inProgressRequests.length}</p>
                <p>Total requests: {washRequests.length}</p>
                <p>User ID: {user?.id}</p>
                <p>User Role: {user?.role}</p>
                <button 
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  onClick={refreshData}
                >
                  Force Refresh
                </button>
              </div>
            )}
            
            {/* Main content */}
            <TodaySchedule
              inProgressRequests={inProgressRequests}
              assignedRequests={assignedRequests}
              onRequestClick={setSelectedRequestId}
              onStartWash={handleStartWash}
              onCompleteWash={handleCompleteWash}
            />
            
            <JobRequestsTabs
              pendingRequests={pendingRequests}
              assignedRequests={assignedRequests}
              onRequestClick={setSelectedRequestId}
              onStartWash={handleStartWash}
            />
            
            {/* Debug toggle button */}
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDebugMode}
                className="text-xs"
              >
                {isDebugMode ? "Hide Debug Info" : "Show Debug Info"}
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Request Detail Dialog */}
      <RequestDetailDialog
        open={!!selectedRequestId}
        onOpenChange={(open) => !open && setSelectedRequestId(null)}
        selectedRequest={selectedRequest}
        userId={user?.id}
        isUpdating={isUpdating}
        onAcceptRequest={handleAcceptRequest}
        onStartWash={handleStartWash}
        onCompleteWash={handleCompleteWash}
      />
      
      {/* Wash Progress Dialog */}
      {activeWashRequest && (
        <VehicleWashProgressDialog
          washRequest={activeWashRequest}
          open={!!activeWashId}
          onOpenChange={(open) => {
            if (!open) setActiveWashId(null);
          }}
          onComplete={handleWashProgressComplete}
        />
      )}
    </AppLayout>
  );
};

export default TechnicianHome;
