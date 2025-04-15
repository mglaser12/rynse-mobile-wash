
import { WashRequest } from "@/models/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Action creator for reopening an in-progress wash request
 */
export const handleReopenWashRequest = (
  setActiveWashId: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  return async (requestId: string): Promise<boolean> => {
    try {
      // Simply set the active wash ID to reopen the dialog
      setActiveWashId(requestId);
      return true;
    } catch (error) {
      console.error("Error reopening wash request:", error);
      return false;
    }
  };
};
