
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VehicleWashStatus, WashRequest } from "@/models/types";
import { VehicleWashForm } from "./VehicleWashForm";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useVehicleWashStatus } from "@/hooks/useVehicleWashStatus";
import { useAuth } from "@/contexts/AuthContext";

interface VehicleWashProgressDialogProps {
  washRequest: WashRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const VehicleWashProgressDialog = ({ 
  washRequest, 
  open, 
  onOpenChange,
  onComplete
}: VehicleWashProgressDialogProps) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wash Progress</DialogTitle>
          <DialogDescription>
            Record information for each vehicle as you complete the wash.
          </DialogDescription>
        </DialogHeader>

        {vehicles.length === 0 ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No vehicles found for this wash request. Please contact support.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {getCompletedCount()} of {vehicles.length} vehicles completed
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full overflow-x-auto flex whitespace-nowrap">
                {vehicles.map((vehicle, index) => {
                  const status = vehicleStatuses.find(s => s.vehicleId === vehicle.id);
                  const isComplete = status?.completed || false;
                  
                  return (
                    <TabsTrigger 
                      key={vehicle.id} 
                      value={vehicle.id}
                      className="relative px-4 py-2"
                    >
                      {isComplete && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
                      )}
                      <span>
                        Vehicle {index + 1}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {vehicles.map((vehicle) => {
                const status = vehicleStatuses.find(s => s.vehicleId === vehicle.id) || {
                  vehicleId: vehicle.id,
                  washRequestId: washRequest.id,
                  technicianId: user?.id,
                  completed: false
                };
                
                return (
                  <TabsContent key={vehicle.id} value={vehicle.id}>
                    <VehicleWashForm 
                      vehicle={vehicle}
                      status={status}
                      onStatusUpdate={handleVehicleStatusUpdate}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleSaveAndExit}>
                Save & Exit
              </Button>
              <Button 
                onClick={handleCompleteWash} 
                disabled={!allComplete}
              >
                Complete All Washes
              </Button>
            </div>
            
            {!allComplete && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                All vehicles must be marked as completed before finishing the wash
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
