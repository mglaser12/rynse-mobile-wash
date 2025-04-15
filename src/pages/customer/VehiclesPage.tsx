
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { Separator } from "@/components/ui/separator";
import { useVehicles } from "@/contexts/VehicleContext";
import { VehicleDialogs } from "@/components/vehicles/VehicleDialogs";
import { VehiclePageSkeleton } from "@/components/vehicles/VehiclePageSkeleton";
import { DemoVehicleButton } from "@/components/vehicles/DemoVehicleButton";
import { VehicleInfoSection } from "@/components/vehicles/VehicleInfoSection";
import { useIsMobile } from "@/hooks/use-mobile";

const VehiclesPage = () => {
  const { vehicles, isLoading } = useVehicles();
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleAddVehicle = () => {
    setShowAddVehicleDialog(true);
  };

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <VehiclePageSkeleton />
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
      
      {/* Scrollable layout container */}
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="car-wash-container animate-fade-in p-4 flex-1 overflow-y-auto">
          <VehicleList 
            onAddVehicle={handleAddVehicle} 
            onSelectVehicle={handleSelectVehicle}
          />
          
          <DemoVehicleButton isVisible={vehicles.length === 0} />
          
          <Separator className="my-6" />
          
          <VehicleInfoSection />
        </div>
      </div>

      {/* Vehicle Dialogs */}
      <VehicleDialogs
        showAddVehicleDialog={showAddVehicleDialog}
        setShowAddVehicleDialog={setShowAddVehicleDialog}
        selectedVehicleId={selectedVehicleId}
        setSelectedVehicleId={setSelectedVehicleId}
      />
    </AppLayout>
  );
};

export default VehiclesPage;
