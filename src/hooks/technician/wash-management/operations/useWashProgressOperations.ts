
import { useCallback } from "react";
import { toast } from "sonner";

interface WashProgressOperationsProps {
  userId: string | undefined;
  updateWashRequest: Function;
  loadData: () => Promise<void>;
  setIsUpdating: (isUpdating: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
  setActiveWashId: (id: string | null) => void;
  activeWashId: string | null;
}

/**
 * Hook for handling wash progress operations (start, reopen, complete)
 */
export function useWashProgressOperations({
  updateWashRequest,
  loadData,
  setIsUpdating,
  setSelectedRequestId,
  setActiveWashId,
  activeWashId
}: WashProgressOperationsProps) {
  
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

  return {
    handleStartWash,
    handleReopenWash,
    handleCompleteWash,
    handleWashProgressComplete
  };
}
