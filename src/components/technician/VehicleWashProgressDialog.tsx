
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { VehicleWashStatus, WashRequest } from "@/models/types";
import { VehicleWashForm } from "./VehicleWashForm";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

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

  // Initialize vehicle statuses
  useEffect(() => {
    if (open && vehicles.length > 0) {
      // Try to get saved progress from localStorage
      const savedProgress = localStorage.getItem(`wash-progress-${washRequest.id}`);
      
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          setVehicleStatuses(parsed);
        } catch (e) {
          console.error("Failed to parse saved progress:", e);
          initializeStatuses();
        }
      } else {
        initializeStatuses();
      }
    }
  }, [open, washRequest.id, vehicles]);

  // Initialize vehicle statuses for tracking
  const initializeStatuses = () => {
    const initialStatuses = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      completed: false,
      notes: ""
    }));
    setVehicleStatuses(initialStatuses);
  };

  // Save progress when vehicle status changes
  useEffect(() => {
    if (vehicleStatuses.length > 0) {
      localStorage.setItem(
        `wash-progress-${washRequest.id}`, 
        JSON.stringify(vehicleStatuses)
      );
    }
  }, [vehicleStatuses, washRequest.id]);

  const handleVehicleStatusUpdate = (updatedStatus: VehicleWashStatus) => {
    setVehicleStatuses(prev => 
      prev.map(status => 
        status.vehicleId === updatedStatus.vehicleId 
          ? updatedStatus 
          : status
      )
    );
  };

  const handleCompleteWash = () => {
    const allCompleted = vehicleStatuses.every(status => status.completed);
    
    if (allCompleted) {
      // Clear saved progress
      localStorage.removeItem(`wash-progress-${washRequest.id}`);
      onComplete();
      toast({
        title: "Wash Completed",
        description: "All vehicles have been successfully washed."
      });
    } else {
      toast({
        variant: "destructive",
        title: "Incomplete Wash",
        description: "Please complete the wash for all vehicles before finishing."
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>
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
