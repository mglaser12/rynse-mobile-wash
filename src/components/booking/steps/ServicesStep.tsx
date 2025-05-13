
import React from "react";
import { ServicesSelectionSection, VehicleService } from "../ServicesSelectionSection";
import { Vehicle } from "@/models/types";

interface ServicesStepProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  vehicleServices: VehicleService[];
  onServiceChange: (vehicleServices: VehicleService[]) => void;
}

export function ServicesStep({
  vehicles,
  selectedVehicleIds,
  vehicleServices,
  onServiceChange
}: ServicesStepProps) {
  return (
    <div className="form-section">
      <ServicesSelectionSection
        vehicles={vehicles}
        selectedVehicleIds={selectedVehicleIds}
        vehicleServices={vehicleServices}
        onServiceChange={onServiceChange}
      />
    </div>
  );
}
