
import React from "react";
import { Button } from "@/components/ui/button";
import { Car, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/models/types";
import { VehicleSelectionTab } from "./VehicleSelectionTab";
import { useIsMobile } from "@/hooks/use-mobile";

interface VehicleSelectionSectionProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  onSelectVehicle: (id: string) => void;
  onCancel: () => void;
  onContinue?: () => void;
}

export function VehicleSelectionSection({
  vehicles,
  selectedVehicleIds,
  onSelectVehicle,
  onCancel,
  onContinue
}: VehicleSelectionSectionProps) {
  const isMobile = useIsMobile();
  
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-10">
        <Car className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No vehicles found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Please add vehicles to your account first.
        </p>
        <Button className="mt-4" onClick={onCancel}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center">
          <Car className="h-4 w-4 mr-2" />
          Select Vehicle(s)
        </Label>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {vehicles.map((vehicle) => (
            <VehicleSelectionTab
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicleIds.includes(vehicle.id)}
              onSelect={() => onSelectVehicle(vehicle.id)}
            />
          ))}
        </div>
      </div>
      
      {isMobile && onContinue && selectedVehicleIds.length > 0 && (
        <Button 
          type="button" 
          className="w-full" 
          onClick={onContinue}
        >
          <Check className="h-4 w-4 mr-2" />
          Continue with {selectedVehicleIds.length} vehicle{selectedVehicleIds.length !== 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}
