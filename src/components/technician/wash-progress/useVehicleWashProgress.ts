
import { useState, useEffect, useCallback, useRef } from "react";
import { VehicleWashStatus, WashRequest } from "@/models/types";
import { useVehicleWashStatus } from "@/hooks/useVehicleWashStatus";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

export const useVehicleWashProgress = (
  washRequest: WashRequest,
  open: boolean,
  onComplete: () => void,
  onOpenChange: (open: boolean) => void
) => {
  const mounted = useRef(true);
  const vehicles = washRequest.vehicleDetails || [];
  const [activeTab, setActiveTab] = useState<string>(
    vehicles.length > 0 ? vehicles[0].id : "0"
  );
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleWashStatus[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchWashStatusesByWashId, saveVehicleWashStatuses } = useVehicleWashStatus();

  const initializeStatuses = useCallback(() => {
    if (!mounted.current) return;
    const initialStatuses = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      washRequestId: washRequest.id,
      technicianId: user?.id,
      completed: false,
      notes: ""
    }));
    setVehicleStatuses(initialStatuses);
  }, [vehicles, washRequest.id, user?.id]);

  const loadWashStatuses = useCallback(async () => {
    if (!washRequest.id || !open || vehicles.length === 0 || !mounted.current) return;
    
    try {
      const savedStatuses = await fetchWashStatusesByWashId(washRequest.id);
      
      if (!mounted.current) return;
      
      if (savedStatuses && savedStatuses.length > 0) {
        setVehicleStatuses(savedStatuses);
      } else {
        initializeStatuses();
      }
    } catch (error) {
      console.error("Failed to load wash statuses:", error);
      if (mounted.current) {
        initializeStatuses();
      }
    }
  }, [washRequest.id, open, vehicles.length, fetchWashStatusesByWashId, initializeStatuses]);

  useEffect(() => {
    mounted.current = true;
    
    if (open && vehicles.length > 0 && washRequest.id) {
      loadWashStatuses();
    }

    return () => {
      mounted.current = false;
    };
  }, [open, washRequest.id, vehicles.length, loadWashStatuses]);

  const handleVehicleStatusUpdate = useCallback((updatedStatus: VehicleWashStatus) => {
    if (!mounted.current) return;
    setVehicleStatuses(prev => 
      prev.map(status => 
        status.vehicleId === updatedStatus.vehicleId ? updatedStatus : status
      )
    );
  }, []);

  const handleCompleteWash = useCallback(async () => {
    if (!mounted.current) return;
    
    const allCompleted = vehicleStatuses.every(status => status.completed);
    if (!allCompleted) {
      toast({
        variant: "destructive",
        title: "Incomplete Wash",
        description: "Please complete the wash for all vehicles before finishing."
      });
      return;
    }

    try {
      const statusesToSave = vehicleStatuses.map(status => ({
        ...status,
        washRequestId: washRequest.id,
        technicianId: user?.id
      }));
      
      await saveVehicleWashStatuses(statusesToSave);
      onComplete();
      
      if (mounted.current) {
        toast({
          title: "Wash Completed",
          description: "All vehicles have been successfully washed."
        });
      }
    } catch (error) {
      console.error("Error saving wash statuses:", error);
      if (mounted.current) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save wash information. Please try again."
        });
      }
    }
  }, [vehicleStatuses, washRequest.id, user?.id, saveVehicleWashStatuses, onComplete, toast]);

  const handleSaveAndExit = useCallback(async () => {
    if (!mounted.current) return;
    
    try {
      const statusesToSave = vehicleStatuses.map(status => ({
        ...status,
        washRequestId: washRequest.id,
        technicianId: user?.id
      }));
      
      await saveVehicleWashStatuses(statusesToSave);
      
      if (mounted.current) {
        toast({
          title: "Progress Saved",
          description: "Your wash progress has been saved."
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
      if (mounted.current) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save progress. Please try again."
        });
      }
    }
  }, [vehicleStatuses, washRequest.id, user?.id, saveVehicleWashStatuses, onOpenChange, toast]);

  const getCompletedCount = useCallback(() => {
    return vehicleStatuses.filter(status => status.completed).length;
  }, [vehicleStatuses]);

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