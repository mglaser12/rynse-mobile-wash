
import { useState, useEffect } from "react";
import { VehicleWashStatus, WashRequest } from "@/models/types";
import { useVehicleWashStatus } from "@/hooks/useVehicleWashStatus";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useVehicleWashProgress = (
  washRequest: WashRequest,
  open: boolean,
  onComplete: () => void,
  onOpenChange: (open: boolean) => void
) => {
  // Get vehicle details from the wash request
  const vehicles = washRequest.vehicleDetails || [];
  const [activeTab, setActiveTab] = useState<string>(vehicles.length > 0 ? vehicles[0].id : "0");
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleWashStatus[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchWashStatusesByWashId, saveVehicleWashStatuses } = useVehicleWashStatus();

  // Initialize vehicle statuses
  useEffect(() => {
    if (open && vehicles.length > 0 && washRequest.id) {
      loadWashStatuses();
    }
  }, [open, washRequest.id, vehicles]);

  const loadWashStatuses = async () => {
    try {
      // Try to get previously saved statuses from database
      const savedStatuses = await fetchWashStatusesByWashId(washRequest.id);
      
      if (savedStatuses && savedStatuses.length > 0) {
        setVehicleStatuses(savedStatuses);
      } else {
        initializeStatuses();
      }
    } catch (error) {
      console.error("Failed to load wash statuses:", error);
      initializeStatuses();
    }
  };

  // Initialize vehicle statuses for tracking
  const initializeStatuses = () => {
    const initialStatuses = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      washRequestId: washRequest.id,
      technicianId: user?.id,
      completed: false,
      notes: ""
    }));
    setVehicleStatuses(initialStatuses);
  };

  // Save progress when vehicle status changes
  const handleVehicleStatusUpdate = (updatedStatus: VehicleWashStatus) => {
    setVehicleStatuses(prev => 
      prev.map(status => 
        status.vehicleId === updatedStatus.vehicleId 
          ? updatedStatus 
          : status
      )
    );
  };

  const handleCompleteWash = async () => {
    const allCompleted = vehicleStatuses.every(status => status.completed);
    
    if (allCompleted) {
      try {
        // Make sure all statuses have required fields
        const statusesToSave = vehicleStatuses.map(status => ({
          ...status,
          washRequestId: washRequest.id,
          technicianId: user?.id
        }));
        
        // Save all statuses to the database
        await saveVehicleWashStatuses(statusesToSave);
        
        onComplete();
        toast({
          title: "Wash Completed",
          description: "All vehicles have been successfully washed."
        });
      } catch (error) {
        console.error("Error saving wash statuses:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save wash information. Please try again."
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Incomplete Wash",
        description: "Please complete the wash for all vehicles before finishing."
      });
    }
  };

  const handleSaveAndExit = async () => {
    try {
      // Save current progress to database
      const statusesToSave = vehicleStatuses.map(status => ({
        ...status,
        washRequestId: washRequest.id,
        technicianId: user?.id
      }));
      
      await saveVehicleWashStatuses(statusesToSave);
      
      toast({
        title: "Progress Saved",
        description: "Your wash progress has been saved."
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save progress. Please try again."
      });
    }
  };

  const getCompletedCount = () => {
    return vehicleStatuses.filter(status => status.completed).length;
  };

  const allComplete = vehicles.length > 0 && getCompletedCount() === vehicles.length;
  
  return {
    vehicles,
    vehicleStatuses,
    activeTab,
    setActiveTab,
    handleVehicleStatusUpdate,
    handleCompleteWash,
    handleSaveAndExit,
    getCompletedCount,
    allComplete
  };
};
