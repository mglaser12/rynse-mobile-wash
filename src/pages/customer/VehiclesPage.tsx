
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { AddVehicleForm } from "@/components/vehicles/AddVehicleForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const VehiclesPage = () => {
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(true);
  };

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
  };

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Your Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your vehicle details</p>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in">
        <VehicleList 
          onAddVehicle={handleAddVehicle} 
          onSelectVehicle={handleSelectVehicle}
        />
        
        <Separator className="my-6" />
        
        <div className="text-sm text-muted-foreground">
          <h3 className="font-medium text-foreground mb-2">About Vehicle Management</h3>
          <p className="mb-2">
            Add all your vehicles to easily schedule washes for them.
            Our OCR technology will automatically detect vehicle information when you upload images.
          </p>
          <p>
            You can update or remove vehicles at any time.
          </p>
        </div>
      </div>

      <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
        <DialogContent className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
          <AddVehicleForm 
            onSuccess={() => setShowAddVehicleDialog(false)}
            onCancel={() => setShowAddVehicleDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default VehiclesPage;
