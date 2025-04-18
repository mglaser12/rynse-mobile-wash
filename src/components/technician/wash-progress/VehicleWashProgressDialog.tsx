
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WashRequest } from "@/models/types";
import { NoVehiclesAlert } from "./NoVehiclesAlert";
import { VehicleWashProgressHeader } from "./VehicleWashProgressHeader";
import { VehicleWashProgressFooter } from "./VehicleWashProgressFooter";
import { VehicleWashProgressTabs } from "./VehicleWashProgressTabs";
import { useVehicleWashProgress } from "./useVehicleWashProgress";

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
  const {
    vehicles,
    vehicleStatuses,
    activeTab,
    setActiveTab,
    handleVehicleStatusUpdate,
    handleCompleteWash,
    handleSaveAndExit,
    getCompletedCount,
    allComplete
  } = useVehicleWashProgress(washRequest, open, onComplete, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vehicle Wash Progress</DialogTitle>
          <DialogDescription>
            Track and update the wash status for each vehicle
          </DialogDescription>
        </DialogHeader>

        <VehicleWashProgressHeader />

        {vehicles.length === 0 ? (
          <NoVehiclesAlert />
        ) : (
          <>
            <VehicleWashProgressTabs 
              vehicles={vehicles}
              vehicleStatuses={vehicleStatuses}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onStatusUpdate={handleVehicleStatusUpdate}
            />
            
            <VehicleWashProgressFooter 
              allComplete={allComplete}
              vehicleCount={vehicles.length}
              completedCount={getCompletedCount()}
              onSaveAndExit={handleSaveAndExit}
              onCompleteWash={handleCompleteWash}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
