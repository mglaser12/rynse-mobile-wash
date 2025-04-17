
import { useEffect } from "react";
import { useWashRequestData } from "./hooks/useWashRequestData";
import { useFetchWashRequests } from "./hooks/useFetchWashRequests";

/**
 * Hook to load wash requests for a user and manage the request state
 */
export function useLoadWashRequests(userId?: string, userRole?: string) {
  const { washRequests, isLoading, updateWashRequests, startLoading } = useWashRequestData();
  const { fetchWashRequests } = useFetchWashRequests();
  
  // Function to refresh data
  const refreshData = async () => {
    if (!userId) {
      updateWashRequests([]);
      return;
    }
    
    startLoading();
    const data = await fetchWashRequests(userId, userRole);
    console.log("Processed wash requests:", data);
    updateWashRequests(data);
  };
  
  // Load wash requests on component mount or when userId changes
  useEffect(() => {
    refreshData();
  }, [userId, userRole]);
  
  return { washRequests, isLoading, refreshData };
}
