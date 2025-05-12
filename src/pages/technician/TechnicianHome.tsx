
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import { TechnicianHeader } from "@/components/technician/TechnicianHeader";
import { TodaySchedule } from "@/components/technician/TodaySchedule";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { VehicleWashProgressDialog } from "@/components/technician/wash-progress/VehicleWashProgressDialog";
import { useWashManagement } from "@/hooks/technician/wash-management";
import { TechnicianJobMap } from "@/components/technician/map/TechnicianJobMap";

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
    handleWashProgressComplete,
    handleCancelAcceptance
  } = useWashManagement();
  
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
    
  // Get job locations for the map
  const jobLocations = Array.isArray(washRequests) 
    ? washRequests
        .filter(req => (
          // Only include jobs assigned to this technician with locations
          (req.status === "confirmed" || req.status === "in_progress") && 
          req.technician === user?.id &&
          req.location && 
          req.location.name
        ))
        .map(req => ({
          id: req.id,
          location: req.location,
          preferredDates: req.preferredDates
        }))
    : [];

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
            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 space-y-4">
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
              </div>
              
              <div className="lg:col-span-5">
                <TechnicianJobMap
                  jobLocations={jobLocations}
                  onSelectJob={setSelectedRequestId}
                  selectedJobId={selectedRequestId}
                />
              </div>
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
        onCancelAcceptance={handleCancelAcceptance}
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
