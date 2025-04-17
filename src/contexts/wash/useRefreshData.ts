
import { useCallback, useRef } from "react";

export function useRefreshData(refreshData: Function) {
  const lastUpdateTimestampRef = useRef<number>(0);
  const pendingRefreshRef = useRef<boolean>(false);
  const forceRefreshRef = useRef<boolean>(false);
  const THROTTLE_INTERVAL = 5000; // 5 second throttle
  
  // Safe refresh data with throttling
  const safeRefreshData = useCallback(async () => {
    const now = Date.now();
    
    // Override throttling if force refresh is requested
    if (forceRefreshRef.current) {
      console.log("Forcing data refresh");
      forceRefreshRef.current = false;
    }
    
    // Throttle refresh calls to prevent flooding
    if (now - lastUpdateTimestampRef.current < THROTTLE_INTERVAL) {
      console.log(`Refresh throttled - too soon after last update (wait ${THROTTLE_INTERVAL/1000}s)`);
      
      // Mark that we need a refresh, but only if not already pending
      if (!pendingRefreshRef.current) {
        pendingRefreshRef.current = true;
        
        // Schedule a refresh after the throttle period
        setTimeout(() => {
          if (pendingRefreshRef.current) {
            console.log("Executing delayed refresh");
            lastUpdateTimestampRef.current = Date.now();
            pendingRefreshRef.current = false;
            
            try {
              refreshData();
            } catch (error) {
              console.error("Error in delayed refresh:", error);
            }
          }
        }, THROTTLE_INTERVAL - (now - lastUpdateTimestampRef.current));
      }
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
  }, [refreshData, THROTTLE_INTERVAL]);
  
  return {
    safeRefreshData,
    lastUpdateTimestampRef,
    pendingRefreshRef,
    forceRefreshRef
  };
}
