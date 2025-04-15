import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
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
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<number>(0);

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
      setLastUpdateTimestamp(Date.now()); // Track when we last updated
      await refreshData();
    }
    return success;
  };

  // Update a wash request with throttling to prevent infinite loops
  const handleUpdateWashRequest = useCallback(async (id: string, data: Partial<WashRequest>) => {
    console.log(`WashContext: Updating request ${id} with:`, data);
    
    // Throttle updates to prevent rapid consecutive calls
    const now = Date.now();
    if (now - lastUpdateTimestamp < 1000) { // 1 second throttle
      console.log("Update throttled - too soon after last update");
    }
    setLastUpdateTimestamp(now);
    
    // Keep a copy of the current state for potential rollback
    const previousState = [...washRequests];
    
    // First update local state for better UX
    setWashRequests(prev => 
      prev.map(request => 
        request.id === id ? { ...request, ...data, updatedAt: new Date() } : request
      )
    );
    
    // Then update in database
    try {
      const success = await updateWashRequest(id, data);
      
      if (success) {
        console.log("Update was successful, refreshing data from server");
        // Force refresh data from server to ensure we have the latest state, but with a delay
        setTimeout(() => {
          refreshData();
        }, 500); // Add a small delay before refreshing
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
    }
  }, [washRequests, lastUpdateTimestamp, refreshData]);

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
    isLoading: isLoadingWashRequests,
    createWashRequest: handleCreateWashRequest,
    cancelWashRequest: handleCancelWashRequest,
    updateWashRequest: handleUpdateWashRequest,
    removeWashRequest: handleRemoveWashRequest,
    getWashRequestById,
    refreshData: useCallback(() => {
      setLastUpdateTimestamp(Date.now());
      refreshData();
    }, [refreshData])
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}

export type { WashContextType };
export * from "./types";
