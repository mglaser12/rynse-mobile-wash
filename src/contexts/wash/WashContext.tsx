
import React, { createContext, useContext } from "react";
import { useAuth } from "../AuthContext";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { useLoadLocations } from "./useLoadLocations";
import { createWashRequest, updateWashRequest, removeWashRequest } from "./washOperations";
import { WashContextType, CreateWashRequestData } from "./types";
import { WashRequest } from "@/models/types";

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWash() {
  return useContext(WashContext);
}

// Create an alias for backward compatibility with existing components
export const useWashRequests = useWash;

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { washRequests, setWashRequests, isLoading: requestsLoading } = useLoadWashRequests(user?.id);
  const { locations, isLoading: locationsLoading } = useLoadLocations();
  
  const isLoading = requestsLoading || locationsLoading;

  // Create a new wash request
  const handleCreateWashRequest = async (requestData: CreateWashRequestData) => {
    return createWashRequest(user?.id, requestData, setWashRequests);
  };

  // Update an existing wash request
  const handleUpdateWashRequest = async (id: string, data: Partial<WashRequest>) => {
    return updateWashRequest(id, data, setWashRequests);
  };

  // Cancel a wash request (convenience function)
  const cancelWashRequest = async (id: string) => {
    return handleUpdateWashRequest(id, { status: "cancelled" });
  };

  // Remove a wash request
  const handleRemoveWashRequest = async (id: string) => {
    return removeWashRequest(id, setWashRequests);
  };

  // Get a wash request by ID
  const getWashRequestById = (id: string) => {
    return washRequests.find(washRequest => washRequest.id === id);
  };

  const value = {
    washRequests,
    locations,
    isLoading,
    createWashRequest: handleCreateWashRequest,
    updateWashRequest: handleUpdateWashRequest,
    removeWashRequest: handleRemoveWashRequest,
    getWashRequestById,
    cancelWashRequest,
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}
