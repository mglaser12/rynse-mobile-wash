
import { toast } from "sonner";

interface AcceptOperationsProps {
  userId: string | undefined;
  updateWashRequest: Function;
  loadData: () => Promise<void>;
  setIsUpdating: (isUpdating: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
}

/**
 * Hook for handling job acceptance operations
 */
export function useAcceptOperations({
  userId,
  updateWashRequest,
  loadData,
  setIsUpdating,
  setSelectedRequestId
}: AcceptOperationsProps) {
  
  // Handle accepting a job request
  const handleAcceptRequest = async (requestId: string) => {
    if (!userId) {
      console.error("Cannot accept request - user ID is undefined");
      toast.error("User authentication error");
      return false;
    }
    
    setIsUpdating(true);
    console.log(`Accepting request ${requestId} as technician ${userId}`);
    
    try {
      // First, ensure the technician ID is set correctly
      console.log("Confirming request with technician ID:", userId);
      
      // Direct database update with minimal complexity
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: userId,
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
    if (!userId) {
      console.error("Cannot schedule job - user ID is undefined");
      toast.error("User authentication error");
      return false;
    }
    
    setIsUpdating(true);
    console.log(`Scheduling job ${requestId} for ${scheduledDate.toISOString()} with technician ${userId}`);
    
    try {
      // Update the request with the scheduled date and technician
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: userId,
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

  return {
    handleAcceptRequest,
    handleScheduleJob
  };
}
