
import { useState, useEffect, useCallback } from "react";
import { useWashRequests } from "@/contexts/WashContext";
import { useAuth } from "@/contexts/AuthContext";
import { WashRequest } from "@/models/types";
import { toast } from "sonner";

export function useWashManagement() {
  const { user } = useAuth();
  const { washRequests = [], isLoading, updateWashRequest, refreshData } = useWashRequests();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeWashId, setActiveWashId] = useState<string | null>(null);
  const [localStateRequests, setLocalStateRequests] = useState<WashRequest[]>([]);
  
  // Load data function to force refresh
  const loadData = useCallback(async () => {
    console.log("Forcing data refresh");
    try {
      await refreshData();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refreshData]);
  
  // Handle accepting a job request
  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) {
      console.error("Cannot accept request - user ID is undefined");
      toast.error("User authentication error");
      return;
    }
    
    setIsUpdating(true);
    console.log(`Accepting request ${requestId} as technician ${user?.id}`);
    
    try {
      // Direct database update with minimal complexity
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user?.id,
      });
      
      if (result) {
        toast.success("Request accepted successfully");
        
        // Force refresh after a successful update to get the latest data
        await loadData();
        
        // Close the dialog after success
        setTimeout(() => {
          setSelectedRequestId(null);
        }, 1000);

        return true;
      } else {
        toast.error("Failed to accept request");
        // Force refresh to ensure we have the current state
        await loadData();
        return false;
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("An error occurred while accepting the request");
      await loadData(); // Refresh data to get current state
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle scheduling a job with a specific date
  const handleScheduleJob = async (requestId: string, scheduledDate: Date) => {
    if (!user?.id) {
      console.error("Cannot schedule job - user ID is undefined");
      toast.error("User authentication error");
      return false;
    }
    
    setIsUpdating(true);
    console.log(`Scheduling job ${requestId} for ${scheduledDate.toISOString()}`);
    
    try {
      // Update the request with the scheduled date and technician
      const result = await updateWashRequest(requestId, {
        status: "confirmed",
        technician: user?.id,
        preferredDates: {
          start: scheduledDate,
          end: undefined
        }
      });
      
      if (result) {
        toast.success("Job scheduled successfully");
        
        // Force refresh after a successful update
        await loadData();
        
        // Close the dialog after success
        setTimeout(() => {
          setSelectedRequestId(null);
        }, 1000);
        
        return true;
      } else {
        toast.error("Failed to schedule job");
        await loadData(); // Refresh to get current state
        return false;
      }
    } catch (error) {
      console.error("Error scheduling job:", error);
      toast.error("An error occurred while scheduling the job");
      await loadData(); // Refresh data to get current state
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle starting a wash
  const handleStartWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      console.log(`Starting wash for request ${requestId}`);
      const result = await updateWashRequest(requestId, {
        status: "in_progress",
      });
      
      if (result) {
        toast.success("Wash started successfully");
        await loadData(); // Force refresh data after starting a wash
        
        // Open the wash progress dialog
        setActiveWashId(requestId);
      } else {
        toast.error("Failed to start wash");
        await loadData(); // Refresh to get current state
      }
    } catch (error) {
      console.error("Error starting wash:", error);
      toast.error("An error occurred while starting the wash");
      await loadData();
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };
  
  // Handle completing a wash
  const handleCompleteWash = async (requestId: string) => {
    setIsUpdating(true);
    try {
      console.log(`Completing wash for request ${requestId}`);
      const result = await updateWashRequest(requestId, {
        status: "completed",
      });
      
      if (result) {
        toast.success("Wash completed successfully");
        await loadData(); // Force refresh data after completing a wash
        
        // Clear any active wash dialog
        if (activeWashId === requestId) {
          setActiveWashId(null);
        }
      } else {
        toast.error("Failed to complete wash");
        await loadData();
      }
    } catch (error) {
      console.error("Error completing wash:", error);
      toast.error("An error occurred while completing the wash");
      await loadData();
    } finally {
      setIsUpdating(false);
      setSelectedRequestId(null);
    }
  };

  const handleWashProgressComplete = async () => {
    if (activeWashId) {
      await handleCompleteWash(activeWashId);
    }
  };
  
  // View job details
  const handleViewJobDetails = useCallback((requestId: string) => {
    setSelectedRequestId(requestId);
  }, []);

  return {
    user,
    washRequests,
    localStateRequests,
    setLocalStateRequests,
    isLoading,
    isUpdating,
    selectedRequestId,
    setSelectedRequestId,
    activeWashId,
    setActiveWashId,
    loadData,
    handleAcceptRequest,
    handleScheduleJob,
    handleStartWash,
    handleCompleteWash,
    handleWashProgressComplete,
    handleViewJobDetails
  };
}
