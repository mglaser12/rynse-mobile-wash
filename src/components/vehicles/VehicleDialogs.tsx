
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AddVehicleForm } from "./AddVehicleForm";
import { EditVehicleForm } from "./EditVehicleForm";
import { Vehicle } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface VehicleDialogsProps {
  showAddVehicleDialog: boolean;
  setShowAddVehicleDialog: (show: boolean) => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
}

export function VehicleDialogs({
  showAddVehicleDialog,
  setShowAddVehicleDialog,
  selectedVehicleId,
  setSelectedVehicleId
}: VehicleDialogsProps) {
  const { vehicles } = useVehicles();
  const isMobile = useIsMobile();
  
  const handleCloseEditDialog = () => {
    setSelectedVehicleId(null);
  };
  
  const selectedVehicle = selectedVehicleId 
    ? vehicles.find(v => v.id === selectedVehicleId) 
    : null;
    
  const dialogContentClass = isMobile 
    ? "w-[calc(100%-32px)] max-w-[95vw] max-h-[80vh] overflow-y-auto p-4" 
    : "w-full max-w-lg overflow-y-auto max-h-[90vh]";

  return (
    <>
      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
        <DialogContent className={dialogContentClass}>
          <AddVehicleForm 
            onSuccess={() => setShowAddVehicleDialog(false)}
            onCancel={() => setShowAddVehicleDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Vehicle Dialog */}
      <Dialog open={!!selectedVehicleId} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent className={dialogContentClass}>
          {selectedVehicle && (
            <EditVehicleForm 
              vehicle={selectedVehicle}
              onSuccess={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
