
import React from "react";
import { ServicesSelectionSection, VehicleService } from "../ServicesSelectionSection";
import { Vehicle } from "@/models/types";

interface EditServicesStepProps {
  filteredVehicles: Vehicle[];
  selectedVehicleIds: string[];
  vehicleServices: VehicleService[];
  onServiceChange: (vehicleServices: VehicleService[]) => void;
}

export function EditServicesStep({
  filteredVehicles,
  selectedVehicleIds,
  vehicleServices,
  onServiceChange
}: EditServicesStepProps) {
  return (
    <div className="form-section">
      <ServicesSelectionSection
        vehicles={filteredVehicles}
        selectedVehicleIds={selectedVehicleIds}
        vehicleServices={vehicleServices}
        onServiceChange={onServiceChange}
      />
    </div>
  );
}
