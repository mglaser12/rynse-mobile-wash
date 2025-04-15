
import React from "react";
import { Check, Car } from "lucide-react";
import { Vehicle } from "@/models/types";

interface VehicleSelectionTabProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}

export function VehicleSelectionTab({ 
  vehicle, 
  isSelected, 
  onSelect 
}: VehicleSelectionTabProps) {
  const vehicleInfo = [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Year", value: vehicle.year },
    { label: "License Plate", value: vehicle.licensePlate || "N/A" }
  ];

  return (
    <div
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
              <Car className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h4 className="font-medium">
              {vehicle.make} {vehicle.model}
            </h4>
            <p className="text-sm text-muted-foreground">
              {vehicle.year} • {vehicle.color}
            </p>
          </div>
        </div>
        {isSelected && (
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
