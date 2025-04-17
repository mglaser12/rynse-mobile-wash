
import { useState, useCallback } from "react";
import { WashRequest } from "@/models/types";

/**
 * Hook to manage wash request data state and refreshing logic
 */
export function useWashRequestData() {
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Function to update local state with new data
  const updateWashRequests = useCallback((data: WashRequest[]) => {
    if (Array.isArray(data)) {
      console.log("Updating wash requests with data:", data);
      setWashRequests(data);
    } else {
      console.log("Received non-array wash requests data:", data);
    }
    setIsLoading(false);
  }, []);
  
  // Function to start loading state
  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);
  
  return {
    washRequests,
    isLoading,
    updateWashRequests,
    startLoading
  };
}
