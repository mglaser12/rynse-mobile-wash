import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { WashRequest } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { WashContextType } from "./types";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { createWashRequest, cancelWashRequest, updateWashRequest } from "./washOperations";

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
  
  // Update local state when loaded wash requests change
  useEffect(() => {
    if (Array.isArray(loadedWashRequests)) {
      console.log("Updating wash requests from loaded data:", loadedWashRequests);
      setWashRequests(loadedWashRequests);
    } else {
      setWashRequests([]);
    }
  }, [loadedWashRequests]);

  // Create a new wash request
  const handleCreateWashRequest = async (washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
    if (!user) return null;
    
    const newWashRequest = await createWashRequest(user, washRequestData);
    if (newWashRequest) {
      setWashRequests(prev => [...prev, newWashRequest]);
    }
    return newWashRequest;
  };

  // Cancel a wash request
  const handleCancelWashRequest = async (id: string) => {
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
  };

  // Safe refresh data with debouncing
  const safeRefreshData = useCallback(async () => {
    const now = Date.now();
    if (now - lastUpdateTimestampRef.current < 3000) { // 3 second throttle
      console.log("Refresh throttled - too soon after last update");
      return;
    }
    
    lastUpdateTimestampRef.current = now;
    console.log("Safely refreshing data");
    await refreshData();
  }, [refreshData]);

  // Update a wash request with throttling to prevent infinite loops
  const handleUpdateWashRequest = useCallback(async (id: string, data: Partial<WashRequest>) => {
    console.log(`WashContext: Updating request ${id} with:`, data);
    
    if (isUpdating) {
      console.log("Update skipped - another update is in progress");
      return false;
    }
    
    // Throttle updates to prevent rapid consecutive calls
    const now = Date.now();
    if (now - lastUpdateTimestampRef.current < 3000) { // 3 second throttle
      console.log("Update throttled - too soon after last update");
      return false;
    }
    
    lastUpdateTimestampRef.current = now;
    setIsUpdating(true);
    
    // Keep a copy of the current state for potential rollback
    const previousState = [...washRequests];
    
    try {
      // First update local state for better UX
      setWashRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, ...data, updatedAt: new Date() } : request
        )
      );
      
      // Then update in database
      const success = await updateWashRequest(id, data);
      
      if (success) {
        console.log("Update was successful, refreshing data from server");
        // Force refresh data from server to ensure we have the latest state, but with a delay
        setTimeout(() => {
          refreshData();
        }, 1500); // Add a small delay before refreshing
        return true;
      } else {
        console.log("Update failed, reverting to previous state");
        // If the update failed, revert to the previous state
        setWashRequests(previousState);
        return false;
      }
    } catch (error) {
      console.error("Error in handleUpdateWashRequest:", error);
      // If there was an error, revert to the previous state
      setWashRequests(previousState);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [washRequests, refreshData, isUpdating]);

  const handleRemoveWashRequest = async (id: string) => {
    // This is a placeholder implementation - in a real app, you'd call an API
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
