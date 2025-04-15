import { WashRequest } from "@/models/types";
import { toast } from "sonner";

export function handleCreateWashRequest(
  user: any,
  washRequests: WashRequest[],
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>,
  createWashRequest: Function
) {
  return async (washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
    if (!user) return null;
    
    try {
      const newWashRequest = await createWashRequest(user, washRequestData);
      if (newWashRequest) {
        setWashRequests(prev => [...prev, newWashRequest]);
      }
      return newWashRequest;
    } catch (error) {
      console.error("Error creating wash request:", error);
      toast.error("Failed to create wash request");
      return null;
    }
  };
}

export function handleCancelWashRequest(
  washRequests: WashRequest[],
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>,
  cancelWashRequest: Function,
  safeRefreshData: Function
) {
  return async (id: string) => {
    try {
      const success = await cancelWashRequest(id);
      if (success) {
        setWashRequests(prev => 
          prev.map(request => 
            request.id === id ? { ...request, status: "cancelled" } : request
          )
        );
        // Force refresh data to ensure everything is in sync
        await safeRefreshData();
      }
      return success;
    } catch (error) {
      console.error("Error cancelling wash request:", error);
      return false;
    }
  };
}

export function handleUpdateWashRequest(
  washRequests: WashRequest[],
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>,
  updateWashRequest: Function,
  safeRefreshData: Function,
  isUpdating: boolean,
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>
) {
  return async (id: string, data: Partial<WashRequest>) => {
    console.log(`WashContext: Updating request ${id} with:`, data);
    
    if (isUpdating) {
      console.log("Update skipped - another update is in progress");
      return false;
    }
    
    setIsUpdating(true);
    
    // Keep a copy of the current state for potential rollback
    const previousState = [...washRequests];
    
    try {
      console.log("Proceeding with update for request:", id);
      
      // First update local state for better UX
      setWashRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, ...data, updatedAt: new Date() } : request
        )
      );
      
      // Then update in database
      const success = await updateWashRequest(id, data);
      
      if (success) {
        console.log("Update was successful");
        
        // Always do a refresh after database update for job acceptance
        if (data.status === "confirmed" && data.technician) {
          console.log("Job acceptance detected - forcing refresh");
          setTimeout(() => {
            safeRefreshData();
          }, 1000);  
        } else {
          // For other updates, do a regular refresh
          setTimeout(() => {
            safeRefreshData();
          }, 2000);
        }
        
        return true;
      } else {
        console.log("Update failed, reverting to previous state");
        // If the update failed, revert to the previous state
        setWashRequests(previousState);
        
        // Force refresh to get the true state from server
        setTimeout(() => {
          safeRefreshData();
        }, 1000);
        
        return false;
      }
    } catch (error) {
      console.error("Error in handleUpdateWashRequest:", error);
      // If there was an error, revert to the previous state
      setWashRequests(previousState);
      
      // Force refresh to get the true state from server
      setTimeout(() => {
        safeRefreshData();
      }, 1000);
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
}

export function handleRemoveWashRequest(
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>
) {
  return async (id: string) => {
    console.log("Remove wash request", id);
    setWashRequests(prev => prev.filter(request => request.id !== id));
  };
}
