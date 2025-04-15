
import { WashRequest } from "@/models/types";

/**
 * Handles the removal of a wash request from local state
 */
export function handleRemoveWashRequest(
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>
) {
  return async (id: string) => {
    console.log("Remove wash request", id);
    setWashRequests(prev => prev.filter(request => request.id !== id));
  };
}
