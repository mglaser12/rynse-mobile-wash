
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
import { Button } from "@/components/ui/button";

const TechnicianHome = () => {
  const { user } = useAuth();
  const { washRequests = [], isLoading, updateWashRequest } = useWashRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Enhanced debug information on mount and when refresh is triggered
  useEffect(() => {
    const checkDatabase = async () => {
      if (user?.id) {
        console.log("TechnicianHome: Manually checking database for wash requests");

        try {
          // Try to directly query all wash requests
          const { data: allRequests, error: allError } = await supabase
            .from('wash_requests')
            .select('id, status, technician_id, user_id');
          
          console.log("Manual database check - All wash requests:", allRequests);
          console.log("Manual database check - Error:", allError);
          
          // Try to directly query all pending requests
          const { data: pendingRequests, error: pendingError } = await supabase
            .from('wash_requests')
            .select('id, status, technician_id, user_id')
            .eq('status', 'pending');
            
          console.log("Manual check - Pending requests:", pendingRequests);
          console.log("Manual check - Pending error:", pendingError);
          
          // Get assigned requests
          const { data: assignedRequests, error: assignedError } = await supabase
            .from('wash_requests')
            .select('id, status, technician_id, user_id')
            .eq('technician_id', user.id);
            
          console.log("Manual check - Assigned requests:", assignedRequests);
          console.log("Manual check - Assigned error:", assignedError);
          
          // Set debug info for UI display if needed
          if (isDebugMode) {
            setDebugInfo({
              all: { data: allRequests, error: allError },
              pending: { data: pendingRequests, error: pendingError },
              assigned: { data: assignedRequests, error: assignedError }
            });
          }
        } catch (err) {
          console.error("Error in manual database check:", err);
          if (isDebugMode) {
            setDebugInfo({ error: String(err) });
          }
        }
      }
    };
    
    checkDatabase();
  }, [user?.id, isDebugMode]);
  
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
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  // Toggle debug mode
  const toggleDebugMode = () => {
    setIsDebugMode(!isDebugMode);
  };

  return (
    <AppLayout>
      <TechnicianHeader 
        userName={user?.name} 
        onRefresh={handleRefresh}
      />
      
      <div className="car-wash-container animate-fade-in p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <>
            {/* Debug section */}
            {isDebugMode && debugInfo && (
              <div className="bg-gray-100 p-4 mb-6 rounded-lg text-xs overflow-auto max-h-48">
                <h3 className="font-bold mb-2">Debug Information:</h3>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
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
