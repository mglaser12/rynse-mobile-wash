
import { useCallback, useRef } from "react";

export function useRefreshData(refreshData: Function) {
  const lastUpdateTimestampRef = useRef<number>(0);
  const pendingRefreshRef = useRef<boolean>(false);
  const forceRefreshRef = useRef<boolean>(false);
  const timeoutIdRef = useRef<number | null>(null); // Track timeout ID for cleanup
  const THROTTLE_INTERVAL = 5000; // 5 second throttle
  
  // Cancel any pending refresh timeouts
  const cancelPendingRefresh = useCallback(() => {
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
      pendingRefreshRef.current = false;
      console.log("Pending refresh canceled");
    }
  }, []);
  
  // Safe refresh data with throttling
  const safeRefreshData = useCallback(async () => {
    // First, always cancel any existing pending refresh to avoid multiple refreshes
    cancelPendingRefresh();
    
    const now = Date.now();
    
    // Override throttling if force refresh is requested
    if (forceRefreshRef.current) {
      console.log("Forcing data refresh");
      forceRefreshRef.current = false;
      
      try {
        await refreshData();
      } catch (error) {
        console.error("Error in forced refresh:", error);
      }
      
      lastUpdateTimestampRef.current = now;
      return;
    }
    
    // Throttle refresh calls to prevent flooding
    if (now - lastUpdateTimestampRef.current < THROTTLE_INTERVAL) {
      console.log(`Refresh throttled - too soon after last update (wait ${THROTTLE_INTERVAL/1000}s)`);
      
      // Mark that we need a refresh and schedule it
      pendingRefreshRef.current = true;
      
      timeoutIdRef.current = window.setTimeout(() => {
        if (pendingRefreshRef.current) {
          console.log("Executing delayed refresh");
          lastUpdateTimestampRef.current = Date.now();
          pendingRefreshRef.current = false;
          timeoutIdRef.current = null;
          
          try {
            refreshData();
          } catch (error) {
            console.error("Error in delayed refresh:", error);
          }
        }
      }, THROTTLE_INTERVAL - (now - lastUpdateTimestampRef.current));
      
      return;
    }
    
    lastUpdateTimestampRef.current = now;
    pendingRefreshRef.current = false;
    console.log("Safely refreshing data");
    
    try {
      await refreshData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshData, THROTTLE_INTERVAL, cancelPendingRefresh]);
  
  return {
    safeRefreshData,
    lastUpdateTimestampRef,
    pendingRefreshRef,
    forceRefreshRef,
    cancelPendingRefresh // Export the cleanup function
  };
}
