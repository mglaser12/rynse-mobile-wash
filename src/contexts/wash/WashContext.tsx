
import React, { createContext, useState, useContext, useEffect } from "react";
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
    }
    return success;
  };

  // Update a wash request
  const handleUpdateWashRequest = async (id: string, data: Partial<WashRequest>) => {
    console.log(`WashContext: Updating request ${id} with:`, data);
    
    // First update local state for better UX
    const updatedLocalState = washRequests.map(request => 
      request.id === id ? { ...request, ...data, updatedAt: new Date() } : request
    );
    setWashRequests(updatedLocalState);
    console.log("Updated local state:", updatedLocalState);
    
    // Then update in database
    const success = await updateWashRequest(id, data);
    
    if (success) {
      console.log("Update was successful, refreshing data from server");
      // Force refresh data from server after a short delay to ensure we have the latest state
      setTimeout(() => refreshData(), 500);
    } else {
      console.log("Update failed, reverting to previous state");
      // If the update failed, revert to the previous state
      setWashRequests(washRequests);
    }
    
    return success;
  };

  const handleRemoveWashRequest = async (id: string) => {
    // This is a placeholder implementation - in a real app, you'd call an API
    console.log("Remove wash request", id);
    setWashRequests(prev => prev.filter(request => request.id !== id));
  };

  const getWashRequestById = (id: string) => {
    return washRequests.find(request => request.id === id);
  };

  const value = {
    washRequests,
    isLoading: isLoadingWashRequests,
    createWashRequest: handleCreateWashRequest,
    cancelWashRequest: handleCancelWashRequest,
    updateWashRequest: handleUpdateWashRequest,
    removeWashRequest: handleRemoveWashRequest,
    getWashRequestById,
    refreshData // Expose the refreshData function
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}

export type { WashContextType };
export * from "./types";
