
import { WashRequest } from "@/models/types";
import { toast } from "sonner";

/**
 * Handles the creation of a wash request
 */
export function handleCreateWashRequest(
  user: any,
  washRequests: WashRequest[],
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>,
  createWashRequest: Function
) {
  return async (washRequestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
    if (!user) return null;
    
    try {
      const newWashRequest = await createWashRequest(user, washRequestData);
      if (newWashRequest) {
        setWashRequests(prev => [...prev, newWashRequest]);
      }
      return newWashRequest;
    } catch (error) {
      console.error("Error creating wash request:", error);
      toast.error("Failed to create wash request");
      return null;
    }
  };
}
