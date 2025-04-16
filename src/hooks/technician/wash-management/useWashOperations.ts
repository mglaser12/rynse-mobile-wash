
import { useCallback } from "react";
import { toast } from "sonner";

interface UseWashOperationsProps {
  user: any;
  updateWashRequest: Function;
  loadData: () => Promise<void>;
  setIsUpdating: (isUpdating: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
  setActiveWashId: (id: string | null) => void;
  activeWashId: string | null;
}

export function useWashOperations({
  user,
  updateWashRequest,
  loadData,
  setIsUpdating,
  setSelectedRequestId,
  setActiveWashId,
  activeWashId
}: UseWashOperationsProps) {
  
  // Handle accepting a job request
  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) {
      console.error("Cannot accept request - user ID is undefined");
      toast.error("User authentication error");
      return false;
    }
    
    setIsUpdating(true);
    console.log(`Accepting request ${requestId} as technician ${user?.id}`);
    
    try {
      // First, ensure the technician ID is set correctly
      console.log("Confirming request with technician ID:", user.id);
      
      // Direct database update with minimal complexity
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user.id,
        // No need to update organization_id here since it should already be set
      });
      
      if (result) {
        toast.success("Request accepted successfully");
        
        // Force refresh after a successful update to get the latest data
        await loadData();
        
        // Close the dialog after success
        setTimeout(() => {
          setSelectedRequestId(null);
        }, 1000);

        return true;
      } else {
        toast.error("Failed to accept request");
        // Force refresh to ensure we have the current state
        await loadData();
        return false;
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("An error occurred while accepting the request");
      await loadData(); // Refresh data to get current state
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle scheduling a job with a specific date
  const handleScheduleJob = async (requestId: string, scheduledDate: Date) => {
    if (!user?.id) {
      console.error("Cannot schedule job - user ID is undefined");
      toast.error("User authentication error");
      return false;
    }
    
    setIsUpdating(true);
    console.log(`Scheduling job ${requestId} for ${scheduledDate.toISOString()} with technician ${user.id}`);
    
    try {
      // Update the request with the scheduled date and technician
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user.id,
        preferredDates: {
          start: scheduledDate,
          end: undefined
        }
        // No need to update organization_id here since it should already be set
      });
      
      if (result) {
        toast.success("Job scheduled successfully");
        
        // Force refresh after a successful update
        await loadData();
        
        // Close the dialog after success
        setTimeout(() => {
          setSelectedRequestId(null);
        }, 1000);
        
        return true;
      } else {
        toast.error("Failed to schedule job");
        await loadData(); // Refresh to get current state
        return false;
      }
    } catch (error) {
      console.error("Error scheduling job:", error);
      toast.error("An error occurred while scheduling the job");
      await loadData(); // Refresh data to get current state
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // The rest of the functions don't need modifications as they only deal with status changes
  // and don't involve changing user or organization associations
  
  // Handle starting a wash
  const handleStartWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      console.log(`Starting wash for request ${requestId}`);
      const result = await updateWashRequest(requestId, {
        status: "in_progress",
      });
      
      if (result) {
        toast.success("Wash started successfully");
        await loadData(); // Force refresh data after starting a wash
        
        // Open the wash progress dialog
        setActiveWashId(requestId);
      } else {
        toast.error("Failed to start wash");
        await loadData(); // Refresh to get current state
      }
    } catch (error) {
      console.error("Error starting wash:", error);
      toast.error("An error occurred while starting the wash");
      await loadData();
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };
  
  // Handle reopening an in-progress wash
  const handleReopenWash = useCallback((requestId: string) => {
    console.log(`Reopening wash for request ${requestId}`);
    setActiveWashId(requestId);
  }, [setActiveWashId]);
  
  // Handle completing a wash
  const handleCompleteWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      console.log(`Completing wash for request ${requestId}`);
      const result = await updateWashRequest(requestId, {
        status: "completed",
      });
      
      if (result) {
        toast.success("Wash completed successfully");
        await loadData(); // Force refresh data after completing a wash
        
        // Clear any active wash dialog
        if (activeWashId === requestId) {
          setActiveWashId(null);
        }
      } else {
        toast.error("Failed to complete wash");
        await loadData();
      }
    } catch (error) {
      console.error("Error completing wash:", error);
      toast.error("An error occurred while completing the wash");
      await loadData();
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
  
  // View job details
  const handleViewJobDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
  }, [setSelectedRequestId]);

  return {
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleReopenWash,
    handleCompleteWash,
    handleWashProgressComplete,
    handleViewJobDetails
  };
}
