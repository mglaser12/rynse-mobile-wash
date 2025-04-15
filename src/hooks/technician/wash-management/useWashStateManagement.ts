
import { useState } from "react";

export function useWashStateManagement() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeWashId, setActiveWashId] = useState<string | null>(null);
  
  return {
    selectedRequestId,
    setSelectedRequestId,
    isUpdating,
    setIsUpdating,
    activeWashId,
    setActiveWashId
  };
}
