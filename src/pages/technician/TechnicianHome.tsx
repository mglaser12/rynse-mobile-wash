
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { TechnicianHeader } from "@/components/technician/TechnicianHeader";
import { TodaySchedule } from "@/components/technician/TodaySchedule";
import { JobRequestsTabs } from "@/components/technician/JobRequestsTabs";
import { RequestDetailDialog } from "@/components/technician/RequestDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TechnicianHome = () => {
  const { user } = useAuth();
  const { washRequests = [], isLoading, updateWashRequest } = useWashRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add debug information on mount
  useEffect(() => {
    const checkDatabase = async () => {
      if (user?.id) {
        console.log("TechnicianHome: Manually checking database for wash requests");

        // Check all wash requests regardless of RLS
        try {
          const { data, error } = await supabase
            .from('wash_requests')
            .select('id, status, technician_id, user_id');
          
          console.log("Manual database check - All wash requests:", data);
          console.log("Manual database check - Error:", error);
        } catch (err) {
          console.error("Error in manual database check:", err);
        }
      }
    };
    
    checkDatabase();
  }, [user?.id]);
  
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
  
  const handleAcceptRequest = async (requestId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user?.id,
      });
      
      if (result) {
        toast.success("Request accepted successfully");
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
  
  // Handle starting a wash
  const handleStartWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateWashRequest(requestId, {
        status: "in_progress",
      });
      
      if (result) {
        toast.success("Wash started successfully");
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
  
  // Handle completing a wash
  const handleCompleteWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateWashRequest(requestId, {
        status: "completed",
      });
      
      if (result) {
        toast.success("Wash completed successfully");
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
