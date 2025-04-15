
import { useCallback, useRef } from "react";

export function useRefreshData(refreshData: Function) {
  const lastUpdateTimestampRef = useRef<number>(0);
  const forceRefreshRef = useRef<boolean>(false);
  
  // Safe refresh data with throttling
  const safeRefreshData = useCallback(async () => {
    const now = Date.now();
    
    // Throttle refresh calls to prevent flooding
    if (now - lastUpdateTimestampRef.current < 3000) { // 3 second throttle
      console.log("Refresh throttled - too soon after last update");
      
      // Mark that we need a refresh as soon as throttling allows
      forceRefreshRef.current = true;
      return;
    }
    
    lastUpdateTimestampRef.current = now;
    console.log("Safely refreshing data");
    
    try {
      await refreshData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshData]);
  
  return {
    safeRefreshData,
    lastUpdateTimestampRef,
    forceRefreshRef
  };
}
