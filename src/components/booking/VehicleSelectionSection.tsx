
import React from "react";
import { Label } from "@/components/ui/label";
import { AddVehicleForm } from "../vehicles/AddVehicleForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle } from "@/models/types";
import { VehicleSelectionTab } from "./VehicleSelectionTab";
import { toast } from "sonner";

interface VehicleSelectionSectionProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  onSelectVehicle: (vehicleId: string) => void;
  onCancel: () => void;
}

export function VehicleSelectionSection({
  vehicles,
  selectedVehicleIds,
  onSelectVehicle,
  onCancel
}: VehicleSelectionSectionProps) {
  const [activeTab, setActiveTab] = React.useState<string>("select");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Select Vehicles</Label>
        <span className="text-sm text-muted-foreground">
          {selectedVehicleIds.length} selected
        </span>
      </div>

      {vehicles.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            You don't have any vehicles yet. Add one to continue.
          </p>
          <AddVehicleForm onCancel={onCancel} />
        </div>
      ) : (
        <Tabs defaultValue="select" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select Vehicle</TabsTrigger>
            <TabsTrigger value="add">Add New Vehicle</TabsTrigger>
          </TabsList>
          <TabsContent value="select" className="py-4">
            <VehicleSelectionTab 
              vehicles={vehicles}
              selectedVehicleIds={selectedVehicleIds}
              onSelectVehicle={onSelectVehicle}
              onAddVehicle={() => setActiveTab("add")}
            />
          </TabsContent>
          <TabsContent value="add">
            <AddVehicleForm 
              onCancel={() => setActiveTab("select")} 
              onSuccess={() => {
                setActiveTab("select");
                toast.success("Vehicle added! Now you can select it for your wash.");
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
