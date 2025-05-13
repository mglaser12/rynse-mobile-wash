
import React from "react";
import { Separator } from "@/components/ui/separator";
import { LocationSelectionSection } from "../LocationSelectionSection";
import { VehicleSelectionSection } from "../VehicleSelectionSection";
import { Location, Vehicle } from "@/models/types";

interface EditLocationVehicleStepProps {
  locations: Location[];
  filteredVehicles: Vehicle[];
  selectedLocationId: string | undefined;
  selectedVehicleIds: string[];
  onLocationChange: (locationId: string) => void;
  onVehicleSelection: (vehicleId: string) => void;
  onCancel: () => void;
}

export function EditLocationVehicleStep({
  locations,
  filteredVehicles,
  selectedLocationId,
  selectedVehicleIds,
  onLocationChange,
  onVehicleSelection,
  onCancel
}: EditLocationVehicleStepProps) {
  return (
    <>
      <div className="form-section">
        <LocationSelectionSection
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={onLocationChange}
        />
      </div>

      <Separator className="my-4" />

      <div className="form-section">
        <VehicleSelectionSection 
          vehicles={filteredVehicles}
          selectedVehicleIds={selectedVehicleIds}
          onSelectVehicle={onVehicleSelection}
          onCancel={onCancel}
          locationSelected={!!selectedLocationId}
        />
      </div>
    </>
  );
}
