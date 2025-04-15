
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VehicleList } from "../vehicles/VehicleList";
import { Vehicle } from "@/models/types";

interface VehicleSelectionTabProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  onSelectVehicle: (vehicleId: string) => void;
  onAddVehicle: () => void;
}

export function VehicleSelectionTab({ 
  vehicles, 
  selectedVehicleIds, 
  onSelectVehicle, 
  onAddVehicle 
}: VehicleSelectionTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredVehicles = searchQuery.trim() === "" 
    ? vehicles 
    : vehicles.filter(vehicle => {
        const searchLower = searchQuery.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
          vehicle.year.toString().includes(searchLower)
        );
      });

  return (
    <>
      <div className="mb-4 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      {filteredVehicles.length > 0 ? (
        <VehicleList 
          vehicles={filteredVehicles}
          onSelectVehicle={onSelectVehicle}
          onAddVehicle={onAddVehicle}
          selectedVehicleIds={selectedVehicleIds}
          selectionMode={true}
        />
      ) : (
        <p className="text-center py-4 text-muted-foreground">
          No vehicles match your search
        </p>
      )}
    </>
  );
}
