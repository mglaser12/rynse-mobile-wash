
import { useCallback, useEffect, useRef } from "react";

export function useDataLoading(refreshData: () => Promise<void> | void) {
  // Reference to track if initial load has happened
  const initialLoadDoneRef = useRef<boolean>(false);
  // Reference to track last refresh timestamp
  const lastRefreshTimeRef = useRef<number>(0);
  // Minimum time between refreshes (in milliseconds)
  const REFRESH_COOLDOWN = 5000; // 5 seconds
  
  // Load data function with cooldown
  const loadData = useCallback(async () => {
    const now = Date.now();
    
    // Check if we're within the cooldown period
    if (now - lastRefreshTimeRef.current < REFRESH_COOLDOWN) {
      console.log("Data refresh throttled - please wait before refreshing again");
      return;
    }
    
    console.log("Executing data refresh");
    lastRefreshTimeRef.current = now;
    
    try {
      // Ensure we always return a Promise, even if refreshData does not
      await Promise.resolve(refreshData());
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshData]);
  
  // Make sure we have the latest data on mount, but only once
  useEffect(() => {
    if (!initialLoadDoneRef.current) {
      console.log("Initial data load");
      loadData();
      initialLoadDoneRef.current = true;
    }
  }, [loadData]);
  
  return { loadData };
}
