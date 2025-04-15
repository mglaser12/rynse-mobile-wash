
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { AddVehicleForm } from "@/components/vehicles/AddVehicleForm";
import { EditVehicleForm } from "@/components/vehicles/EditVehicleForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useVehicles } from "@/contexts/VehicleContext";
import { Skeleton } from "@/components/ui/skeleton";

const VehiclesPage = () => {
  const { vehicles, isLoading } = useVehicles();
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(true);
  };

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
  };

  const handleCloseEditDialog = () => {
    setSelectedVehicleId(null);
  };

  const selectedVehicle = selectedVehicleId 
    ? vehicles.find(v => v.id === selectedVehicleId) 
    : null;

  if (isLoading) {
    return (
      <AppLayout>
        <header className="bg-white p-4 border-b sticky top-0 z-10">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Your Vehicles</h1>
            <p className="text-sm text-muted-foreground">Manage your vehicle details</p>
          </div>
        </header>
        
        <div className="car-wash-container animate-fade-in p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-9 w-[120px]" />
            </div>
            
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Your Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your vehicle details</p>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in p-4">
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

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
        <DialogContent className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
          <AddVehicleForm 
            onSuccess={() => setShowAddVehicleDialog(false)}
            onCancel={() => setShowAddVehicleDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Vehicle Dialog */}
      <Dialog open={!!selectedVehicleId} onOpenChange={(open) => !open && handleCloseEditDialog()}>
        <DialogContent className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
          {selectedVehicle && (
            <EditVehicleForm 
              vehicle={selectedVehicle}
              onSuccess={handleCloseEditDialog}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default VehiclesPage;
