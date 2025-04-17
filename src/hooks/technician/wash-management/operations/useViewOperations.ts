
import { useCallback } from "react";

interface ViewOperationsProps {
  setSelectedRequestId: (id: string | null) => void;
}

/**
 * Hook for handling view-related operations
 */
export function useViewOperations({
  setSelectedRequestId
}: ViewOperationsProps) {
  
  // View job details
  const handleViewJobDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
  }, [setSelectedRequestId]);

  return {
    handleViewJobDetails
  };
}
