
import { toast } from "sonner";
import { X } from "lucide-react";

interface CancelAcceptanceOperationsProps {
  updateWashRequest: Function;
  loadData: () => Promise<void>;
  setIsUpdating: (isUpdating: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
}

/**
 * Hook for handling cancellation of job acceptance
 */
export function useCancelAcceptanceOperations({
  updateWashRequest,
  loadData,
  setIsUpdating,
  setSelectedRequestId
}: CancelAcceptanceOperationsProps) {
  
  // Handle cancelling a job acceptance - revert to pending status
  const handleCancelAcceptance = async (requestId: string) => {
    setIsUpdating(true);
    console.log(`Cancelling acceptance for request ${requestId}`);
    
    try {
      // Update the request to remove technician assignment and set status back to pending
      const result = await updateWashRequest(requestId, {
        status: "pending",
        technician: null
      });
      
      if (result) {
        toast.success("Job returned to pending status", {
          description: "The job is now available for other technicians"
        });
        
        // Force refresh after a successful update
        await loadData();
        
        // Close the dialog after success
        setTimeout(() => {
          setSelectedRequestId(null);
        }, 1000);
        
        return true;
      } else {
        toast.error("Failed to cancel job acceptance");
        await loadData(); // Refresh to get current state
        return false;
      }
    } catch (error) {
      console.error("Error cancelling job acceptance:", error);
      toast.error("An error occurred while cancelling job acceptance");
      await loadData(); // Refresh data to get current state
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    handleCancelAcceptance
  };
}
