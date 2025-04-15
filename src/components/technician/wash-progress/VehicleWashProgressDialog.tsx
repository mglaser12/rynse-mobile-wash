
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
        <VehicleWashProgressHeader />

        {vehicles.length === 0 ? (
          <NoVehiclesAlert />
        ) : (
          <>
            <VehicleWashProgressFooter 
              allComplete={allComplete}
              vehicleCount={vehicles.length}
              completedCount={getCompletedCount()}
              onSaveAndExit={handleSaveAndExit}
              onCompleteWash={handleCompleteWash}
            />
            
            <VehicleWashProgressTabs 
              vehicles={vehicles}
              vehicleStatuses={vehicleStatuses}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onStatusUpdate={handleVehicleStatusUpdate}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
