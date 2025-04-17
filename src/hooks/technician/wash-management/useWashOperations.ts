
import { 
  useAcceptOperations,
  useWashProgressOperations,
  useViewOperations,
  useCancelAcceptanceOperations
} from './operations';

interface UseWashOperationsProps {
  user: any;
  updateWashRequest: Function;
  loadData: () => Promise<void>;
  setIsUpdating: (isUpdating: boolean) => void;
  setSelectedRequestId: (id: string | null) => void;
  setActiveWashId: (id: string | null) => void;
  activeWashId: string | null;
}

/**
 * Hook that combines all wash operations into a single interface
 */
export function useWashOperations({
  user,
  updateWashRequest,
  loadData,
  setIsUpdating,
  setSelectedRequestId,
  setActiveWashId,
  activeWashId
}: UseWashOperationsProps) {
  
  // Use the specialized operation hooks
  const { handleAcceptRequest, handleScheduleJob } = useAcceptOperations({
    userId: user?.id,
    updateWashRequest,
    loadData,
    setIsUpdating,
    setSelectedRequestId
  });
  
  const { 
    handleStartWash, 
    handleReopenWash, 
    handleCompleteWash,
    handleWashProgressComplete 
  } = useWashProgressOperations({
    userId: user?.id,
    updateWashRequest,
    loadData,
    setIsUpdating,
    setSelectedRequestId,
    setActiveWashId,
    activeWashId
  });
  
  const { handleViewJobDetails } = useViewOperations({
    setSelectedRequestId
  });

  const { handleCancelAcceptance } = useCancelAcceptanceOperations({
    updateWashRequest,
    loadData,
    setIsUpdating,
    setSelectedRequestId
  });

  // Return all operations from a single interface
  return {
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleReopenWash,
    handleCompleteWash,
    handleWashProgressComplete,
    handleViewJobDetails,
    handleCancelAcceptance
  };
}
