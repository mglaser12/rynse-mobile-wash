
import { WashRequest } from "@/models/types";

/**
 * Handles the cancellation of a wash request
 */
export function handleCancelWashRequest(
  washRequests: WashRequest[],
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>,
  cancelWashRequest: Function,
  safeRefreshData: Function
) {
  return async (id: string) => {
    try {
      const success = await cancelWashRequest(id);
      if (success) {
        setWashRequests(prev => 
          prev.map(request => 
            request.id === id ? { ...request, status: "cancelled" } : request
          )
        );
        // Force refresh data to ensure everything is in sync
        await safeRefreshData();
      }
      return success;
    } catch (error) {
      console.error("Error cancelling wash request:", error);
      return false;
    }
  };
}
