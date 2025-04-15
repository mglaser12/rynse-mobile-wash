
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWashRequests } from "@/contexts/WashContext";
import { useWashStateManagement } from "./useWashStateManagement";
import { useWashOperations } from "./useWashOperations";
import { useDataLoading } from "./useDataLoading";

export function useWashManagement() {
  const { user } = useAuth();
  const { washRequests = [], isLoading, updateWashRequest, refreshData } = useWashRequests();
  
  // Extract state management to a separate hook
  const { 
    selectedRequestId, 
    setSelectedRequestId,
    isUpdating,
    setIsUpdating, 
    activeWashId, 
    setActiveWashId 
  } = useWashStateManagement();
  
  // Extract data loading operations - ensuring refreshData is handled properly
  const { loadData } = useDataLoading(refreshData);
  
  // Extract wash operations into a separate hook
  const {
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleReopenWash,
    handleCompleteWash,
    handleWashProgressComplete,
    handleViewJobDetails
  } = useWashOperations({
    user,
    updateWashRequest,
    loadData, 
    setIsUpdating, 
    setSelectedRequestId, 
    setActiveWashId,
    activeWashId
  });
  
  return {
    // User data
    user,
    
    // Request data
    washRequests,
    isLoading,
    isUpdating,
    
    // State management
    selectedRequestId,
    setSelectedRequestId,
    activeWashId,
    setActiveWashId,
    
    // Data operations
    loadData,
    
    // Wash operations
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleReopenWash,
    handleCompleteWash,
    handleWashProgressComplete,
    handleViewJobDetails
  };
}
