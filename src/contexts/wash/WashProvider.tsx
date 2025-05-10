import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { WashRequest } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { WashContextType } from "./types";
import { useLoadWashRequests } from "./useLoadWashRequests";
import { createWashRequest, cancelWashRequest, updateWashRequest } from "./operations";
import { useRefreshData } from "./useRefreshData";
import { 
  handleCreateWashRequest,
  handleCancelWashRequest, 
  handleUpdateWashRequest,
  handleRemoveWashRequest 
} from "./actions";

// Create the context
export const WashContext = createContext<WashContextType>({} as WashContextType);

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { 
    washRequests: loadedWashRequests, 
    isLoading: isLoadingWashRequests,
    refreshData 
  } = useLoadWashRequests(user?.id, user?.role);
  
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { safeRefreshData, forceRefreshRef, lastUpdateTimestampRef, pendingRefreshRef } = useRefreshData(refreshData);
  
  // Update local state when loaded wash requests change
  useEffect(() => {
    if (Array.isArray(loadedWashRequests)) {
      console.log("Updating wash requests from loaded data:", loadedWashRequests);
      setWashRequests(loadedWashRequests);
      // Reset force refresh flag when data is actually loaded
      if (forceRefreshRef) {
        forceRefreshRef.current = false;
      }
    } else {
      // If we get undefined or null, keep existing state
      console.log("Received non-array wash requests data:", loadedWashRequests);
    }
  }, [loadedWashRequests, forceRefreshRef]);

  // Set up a timer to handle deferred refreshes due to throttling
  useEffect(() => {
    const checkPendingRefresh = () => {
      if (forceRefreshRef && forceRefreshRef.current) {
        const now = Date.now();
        if (now - lastUpdateTimestampRef.current >= 3000) {
          console.log("Executing pending refresh");
          safeRefreshData();
        }
      }
    };
    
    const timer = setInterval(checkPendingRefresh, 1000);
    return () => clearInterval(timer);
  }, [safeRefreshData, forceRefreshRef, lastUpdateTimestampRef]);

  // Create action handlers
  const handleCreate = handleCreateWashRequest(user, washRequests, setWashRequests, createWashRequest);
  const handleCancel = handleCancelWashRequest(washRequests, setWashRequests, cancelWashRequest, safeRefreshData);
  const handleUpdate = handleUpdateWashRequest(
    washRequests, setWashRequests, updateWashRequest, safeRefreshData, isUpdating, setIsUpdating
  );
  const handleRemove = handleRemoveWashRequest(setWashRequests);

  const getWashRequestById = useCallback((id: string) => {
    return washRequests.find(request => request.id === id);
  }, [washRequests]);

  const value = {
    washRequests,
    isLoading: isLoadingWashRequests || isUpdating,
    createWashRequest: handleCreate,
    cancelWashRequest: handleCancel,
    updateWashRequest: handleUpdate,
    removeWashRequest: handleRemove,
    getWashRequestById,
    refreshData: safeRefreshData
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}
