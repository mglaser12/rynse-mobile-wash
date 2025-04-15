
import React, { createContext, useContext, useEffect, useState } from "react";
import { WashContextType } from "./types";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { useLoadLocations } from "./useLoadLocations";
import { createWashRequest as createWashOp, updateWashRequest as updateWashOp, removeWashRequest as removeWashOp, cancelWashRequest as cancelWashOp } from "./washOperations";
import { WashLocation, WashRequest } from "@/models/types";

const WashContext = createContext<WashContextType>({} as WashContextType);

export const useWashRequests = () => useContext(WashContext);
export const useWash = useWashRequests; // Alias for backward compatibility

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { washRequests, isLoading: isLoadingRequests } = useLoadWashRequests();
  const { locations, isLoading: isLoadingLocations } = useLoadLocations();
  const [isLoading, setIsLoading] = useState(true);

  // Update loading state based on both loading states
  useEffect(() => {
    setIsLoading(isLoadingRequests || isLoadingLocations);
  }, [isLoadingRequests, isLoadingLocations]);

  const createWashRequest = async (requestData: any) => {
    const newRequest = await createWashOp(requestData);
    return newRequest;
  };

  const updateWashRequest = async (id: string, data: Partial<WashRequest>) => {
    return await updateWashOp(id, data);
  };

  const removeWashRequest = async (id: string) => {
    await removeWashOp(id);
  };

  const getWashRequestById = (id: string) => {
    return washRequests.find(request => request.id === id);
  };

  const cancelWashRequest = async (id: string) => {
    return await cancelWashOp(id);
  };

  const value: WashContextType = {
    washRequests,
    locations,
    isLoading,
    createWashRequest,
    updateWashRequest,
    removeWashRequest,
    getWashRequestById,
    cancelWashRequest,
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}

export type { WashContextType } from "./types";
