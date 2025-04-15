
import { useCallback, useEffect } from "react";

export function useDataLoading(refreshData: () => Promise<void> | void) {
  // Load data function to force refresh
  const loadData = useCallback(async () => {
    console.log("Forcing data refresh");
    try {
      // Ensure we always return a Promise, even if refreshData does not
      await Promise.resolve(refreshData());
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshData]);
  
  // Make sure we have the latest data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return { loadData };
}
