
import React, { createContext, useState, useContext, useEffect } from "react";
import { WashLocation, WashRequest } from "@/models/types";
import { useAuth } from "../AuthContext";
import { WashContextType } from "./types";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { useLoadLocations } from "./useLoadLocations";
import { createWashRequest, cancelWashRequest } from "./washOperations";

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWashRequests() {
  return useContext(WashContext);
}

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { washRequests: loadedWashRequests, isLoading: isLoadingWashRequests } = useLoadWashRequests(user?.id);
  const { locations, isLoading: isLoadingLocations } = useLoadLocations();
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);

  // Update local state when loaded wash requests change
  useEffect(() => {
    setWashRequests(loadedWashRequests);
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

  const value = {
    washRequests,
    locations,
    isLoading: isLoadingWashRequests || isLoadingLocations,
    createWashRequest: handleCreateWashRequest,
    cancelWashRequest: handleCancelWashRequest
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}

export type { WashContextType };
export * from "./types";
