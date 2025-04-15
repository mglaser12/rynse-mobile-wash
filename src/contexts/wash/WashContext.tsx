
import React, { createContext, useState, useContext, useEffect } from "react";
import { WashRequest } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { WashContextType } from "./types";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { createWashRequest, cancelWashRequest } from "./washOperations";

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
  const { washRequests: loadedWashRequests, isLoading: isLoadingWashRequests } = useLoadWashRequests(
    user?.id, 
    user?.role
  );
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);

  // Update local state when loaded wash requests change
  useEffect(() => {
    setWashRequests(Array.isArray(loadedWashRequests) ? loadedWashRequests : []);
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

  // Implement missing methods required by WashContextType
  const handleUpdateWashRequest = async (id: string, data: Partial<WashRequest>) => {
    // This is a placeholder implementation - in a real app, you'd call an API
    console.log("Update wash request", id, data);
    return true;
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
    getWashRequestById
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}

export type { WashContextType };
export * from "./types";
