
import { CreateWashRequestData } from "../types";
import { WashRequest, Vehicle } from "@/models/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Action creator for creating wash requests
export const handleCreateWashRequest = (
  user: any,
  washRequests: WashRequest[],
  setWashRequests: (washRequests: WashRequest[]) => void,
  createWashRequestOperation: (data: CreateWashRequestData) => Promise<WashRequest | null>
) => {
  return async (data: CreateWashRequestData): Promise<WashRequest | null> => {
    if (!user) {
      throw new Error("User must be authenticated to create a wash request");
    }
    
    const now = new Date();
    const { locationId, ...requestData } = data;
    
    try {
      console.log("Creating wash request with data:", data);
      
      // Use the operation to create the wash request
      const newWashRequest = await createWashRequestOperation(data);
      
      if (newWashRequest) {
        // Update the client state
        setWashRequests([...washRequests, newWashRequest]);
        toast.success("Wash request created successfully");
        return newWashRequest;
      } else {
        // If the operation failed
        toast.error("Failed to create wash request");
        return null;
      }
    } catch (error) {
      console.error("Error creating wash request:", error);
      toast.error("Failed to create wash request");
      throw error;
    }
  };
};
