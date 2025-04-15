import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { WashRequest } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { WashContextType } from "./types";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { createWashRequest, cancelWashRequest, updateWashRequest } from "./operations";
import { toast } from "sonner";

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWashRequests() {
  return useContext(WashContext);
}

// Add a useWash alias for backward compatibility
export function useWash() {
  return useContext(WashContext);
}

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { 
    washRequests: loadedWashRequests, 
    isLoading: isLoadingWashRequests,
    refreshData 
  } = useLoadWashRequests(
    user?.id, 
    user?.role
  );
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const lastUpdateTimestampRef = useRef<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const forceRefreshRef = useRef<boolean>(false);
  
  // Update local state when loaded wash requests change
  useEffect(() => {
    if (Array.isArray(loadedWashRequests)) {
      console.log("Updating wash requests from loaded data:", loadedWashRequests);
      setWashRequests(loadedWashRequests);
      // Reset force refresh flag when data is actually loaded
      forceRefreshRef.current = false;
    } else {
      // If we get undefined or null, keep existing state
      console.log("Received non-array wash requests data:", loadedWashRequests);
    }
  }, [loadedWashRequests]);

  // Create a new wash request
  const handleCreateWashRequest = async (washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
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

  // Cancel a wash request
  const handleCancelWashRequest = async (id: string) => {
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

  // Safe refresh data with throttling - updatedt to not use force parameter
  const safeRefreshData = useCallback(async () => {
    const now = Date.now();
    
    // Throttle refresh calls to prevent flooding
    if (now - lastUpdateTimestampRef.current < 3000) { // 3 second throttle
      console.log("Refresh throttled - too soon after last update");
      
      // Mark that we need a refresh as soon as throttling allows
      forceRefreshRef.current = true;
      return;
    }
    
    lastUpdateTimestampRef.current = now;
    console.log("Safely refreshing data");
    
    try {
      await refreshData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshData]);
  
  // Set up a timer to handle deferred refreshes due to throttling
  useEffect(() => {
    const checkPendingRefresh = () => {
      if (forceRefreshRef.current) {
        const now = Date.now();
        if (now - lastUpdateTimestampRef.current >= 3000) {
          console.log("Executing pending refresh");
          safeRefreshData();
        }
      }
    };
    
    const timer = setInterval(checkPendingRefresh, 1000);
    return () => clearInterval(timer);
  }, [safeRefreshData]);

  // Update a wash request with improved handling for job acceptance
  const handleUpdateWashRequest = useCallback(async (id: string, data: Partial<WashRequest>) => {
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
  }, [washRequests, safeRefreshData, isUpdating]);

  const handleRemoveWashRequest = async (id: string) => {
    console.log("Remove wash request", id);
    setWashRequests(prev => prev.filter(request => request.id !== id));
  };

  const getWashRequestById = useCallback((id: string) => {
    return washRequests.find(request => request.id === id);
  }, [washRequests]);

  const value = {
    washRequests,
    isLoading: isLoadingWashRequests || isUpdating,
    createWashRequest: handleCreateWashRequest,
    cancelWashRequest: handleCancelWashRequest,
    updateWashRequest: handleUpdateWashRequest,
    removeWashRequest: handleRemoveWashRequest,
    getWashRequestById,
    refreshData: safeRefreshData
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}

export type { WashContextType };
export * from "./types";
