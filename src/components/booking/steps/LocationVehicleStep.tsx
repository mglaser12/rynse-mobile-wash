
import React from "react";
import { Separator } from "@/components/ui/separator";
import { LocationSelectionSection } from "../LocationSelectionSection";
import { VehicleSelectionSection } from "../VehicleSelectionSection";
import { Location, Vehicle } from "@/models/types";

interface LocationVehicleStepProps {
  locations: Location[];
  vehicles: Vehicle[];
  selectedLocationId?: string;
  selectedVehicleIds: string[];
  onSelectLocation: (locationId: string) => void;
  onSelectVehicle: (id: string) => void;
  onCancel: () => void;
}

export function LocationVehicleStep({
  locations,
  vehicles,
  selectedLocationId,
  selectedVehicleIds,
  onSelectLocation,
  onSelectVehicle,
  onCancel
}: LocationVehicleStepProps) {
  return (
    <>
      <div className="form-section">
        <LocationSelectionSection
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
        />
      </div>

      <Separator className="my-4" />

      <div className="form-section">
        <VehicleSelectionSection 
          vehicles={vehicles}
          selectedVehicleIds={selectedVehicleIds}
          onSelectVehicle={onSelectVehicle}
          onCancel={onCancel}
          locationSelected={!!selectedLocationId}
        />
      </div>
    </>
  );
}
