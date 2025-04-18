
import React, { useState } from "react";
import { useVehicles } from "@/contexts/VehicleContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddVehicleForm } from "./AddVehicleForm";
import { EditVehicleForm } from "./EditVehicleForm";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { VehicleWashHistory } from "./VehicleWashHistory";

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
  setSelectedVehicleId,
}: VehicleDialogsProps) {
  const { getVehicleById } = useVehicles();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const selectedVehicle = selectedVehicleId ? getVehicleById(selectedVehicleId) : null;

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleCloseVehicleDetailsDialog = () => {
    setSelectedVehicleId(null);
    setShowEditForm(false);
  };

  const handleEditFormClose = () => {
    setShowEditForm(false);
  };

  const handleShowDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>Enter details to add a vehicle to your account</DialogDescription>
          </DialogHeader>
          <AddVehicleForm 
            onSuccess={() => setShowAddVehicleDialog(false)}
            onCancel={() => setShowAddVehicleDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Vehicle Details Dialog */}
      <Dialog
        open={!!selectedVehicleId && !showEditForm && !showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseVehicleDetailsDialog();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vehicle Details</DialogTitle>
            <DialogDescription>View details and wash history for this vehicle</DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <VehicleWashHistory 
              vehicle={selectedVehicle} 
              onEditVehicle={handleEditClick} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog
        open={!!selectedVehicleId && showEditForm && !showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) handleEditFormClose();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update vehicle information</DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <EditVehicleForm
              vehicle={selectedVehicle}
              onCancel={handleEditFormClose}
              onSuccess={() => {
                handleEditFormClose();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Vehicle Dialog is already wrapped in an AlertDialog which has its own structure */}
      <DeleteVehicleDialog
        isOpen={showDeleteDialog}
        isDeleting={false}
        onDelete={async () => {
          // This will be handled by the DeleteVehicleDialog component
          setShowDeleteDialog(false);
          setSelectedVehicleId(null);
        }}
        onCancel={() => setShowDeleteDialog(false)}
        vehicleName={
          selectedVehicle
            ? `${selectedVehicle.make} ${selectedVehicle.model}`
            : ""
        }
      />
    </>
  );
}
