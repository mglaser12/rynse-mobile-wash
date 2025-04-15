
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { AddVehicleForm } from "@/components/vehicles/AddVehicleForm";
import { EditVehicleForm } from "@/components/vehicles/EditVehicleForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useVehicles } from "@/contexts/VehicleContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VehiclesPage = () => {
  const { user } = useAuth();
  const { vehicles, isLoading, addVehicle } = useVehicles();
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isAddingDemoVehicles, setIsAddingDemoVehicles] = useState(false);

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(true);
  };

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
  };

  const handleCloseEditDialog = () => {
    setSelectedVehicleId(null);
  };

  const addDemoVehicles = async () => {
    if (!user) {
      toast.error("You must be logged in to add vehicles");
      return;
    }

    setIsAddingDemoVehicles(true);
    
    try {
      const heavyDutyVehicles = [
        {
          make: "Caterpillar",
          model: "D9 Dozer",
          year: "2022",
          type: "Heavy Duty",
          color: "Yellow",
          licensePlate: "HD-1234"
        },
        {
          make: "Komatsu",
          model: "PC800 Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "Orange",
          licensePlate: "HD-5678"
        },
        {
          make: "John Deere",
          model: "9R Tractor",
          year: "2023",
          type: "Heavy Duty",
          color: "Green",
          licensePlate: "HD-9012"
        },
        {
          make: "Volvo",
          model: "EC750E Excavator",
          year: "2020",
          type: "Heavy Duty",
          color: "Gray",
          licensePlate: "HD-3456"
        },
        {
          make: "Liebherr",
          model: "R 9800 Mining Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "White",
          licensePlate: "HD-7890"
        }
      ];

      for (const vehicle of heavyDutyVehicles) {
        await addVehicle({
          ...vehicle,
          customerId: user.id
        });
      }

      toast.success("Added 5 demo heavy duty vehicles!");
    } catch (error) {
      console.error("Error adding demo vehicles:", error);
      toast.error("Failed to add demo vehicles");
    } finally {
      setIsAddingDemoVehicles(false);
    }
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
        
        {vehicles.length === 0 && (
          <div className="mt-6">
            <Button 
              onClick={addDemoVehicles}
              variant="outline"
              className="w-full"
              disabled={isAddingDemoVehicles}
            >
              {isAddingDemoVehicles ? "Adding Demo Vehicles..." : "Add 5 Demo Heavy Duty Vehicles"}
            </Button>
          </div>
        )}
        
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
