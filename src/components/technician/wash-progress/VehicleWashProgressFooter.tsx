
import React from "react";
import { Button } from "@/components/ui/button";

interface VehicleWashProgressFooterProps {
  allComplete: boolean;
  vehicleCount: number;
  completedCount: number;
  onSaveAndExit: () => void;
  onCompleteWash: () => void;
}

export const VehicleWashProgressFooter = ({
  allComplete,
  vehicleCount,
  completedCount,
  onSaveAndExit,
  onCompleteWash
}: VehicleWashProgressFooterProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {completedCount} of {vehicleCount} vehicles completed
        </p>
      </div>
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onSaveAndExit}>
          Save & Exit
        </Button>
        <Button 
          onClick={onCompleteWash} 
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
  );
};
