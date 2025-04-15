
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWashRequests } from "@/contexts/WashContext";
import { Loader2 } from "lucide-react";
import { TechnicianHeader } from "@/components/technician/TechnicianHeader";
import { TodaySchedule } from "@/components/technician/TodaySchedule";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { Button } from "@/components/ui/button";
import { VehicleWashProgressDialog } from "@/components/technician/wash-progress/VehicleWashProgressDialog";
import { DebugPanel } from "@/components/technician/DebugPanel";
import { useWashManagement } from "@/hooks/technician/wash-management";

const TechnicianHome = () => {
  const { 
    user,
    washRequests,
    isLoading, 
    isUpdating,
    selectedRequestId,
    setSelectedRequestId,
    activeWashId,
    setActiveWashId,
    loadData,
    handleAcceptRequest,
    handleStartWash,
    handleReopenWash,
    handleCompleteWash,
    handleWashProgressComplete
  } = useWashManagement();
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  // Force a refresh of wash requests data when the component mounts
  useEffect(() => {
    console.log("TechnicianHome mounted - loading initial data");
    loadData();
  }, [loadData]);
  
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
              <DebugPanel
                pendingRequests={pendingRequests}
                assignedRequests={assignedRequests}
                inProgressRequests={inProgressRequests}
                washRequests={washRequests}
                userId={user?.id}
                userRole={user?.role}
                localStateRequests={washRequests}
                onRefresh={loadData}
              />
            )}
            
            {/* Main content */}
            <TodaySchedule
              inProgressRequests={inProgressRequests}
              assignedRequests={assignedRequests}
              onRequestClick={setSelectedRequestId}
              onStartWash={handleStartWash}
              onReopenWash={handleReopenWash}
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
