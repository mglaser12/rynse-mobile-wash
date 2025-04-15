
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { TechnicianHeader } from "@/components/technician/TechnicianHeader";
import { TodaySchedule } from "@/components/technician/TodaySchedule";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";

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
      <TechnicianHeader userName={user?.name} />
      
      <div className="car-wash-container animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
      
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
    </AppLayout>
  );
};

export default TechnicianHome;
