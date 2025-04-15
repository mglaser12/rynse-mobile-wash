
import { useCallback, useEffect } from "react";

export function useDataLoading(refreshData: () => Promise<void>) {
  // Load data function to force refresh
  const loadData = useCallback(async () => {
    console.log("Forcing data refresh");
    try {
      await refreshData();
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
