
import React from "react";
import { Button } from "@/components/ui/button";
import { Car, AlertCircle, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Vehicle } from "@/models/types";
import { VehicleSelectionTab } from "./VehicleSelectionTab";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVehicleWashHistory } from "@/hooks/useVehicleWashHistory";
import { PulseSoft, AnimatedButton, ScaleIn, StaggeredChildren } from "@/components/ui/micro-animations";
import { cn } from "@/lib/utils";

interface VehicleSelectionSectionProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  onSelectVehicle: (id: string) => void;
  onCancel: () => void;
  onContinue?: () => void;
  locationSelected?: boolean;
}

export function VehicleSelectionSection({
  vehicles,
  selectedVehicleIds,
  onSelectVehicle,
  onCancel,
  onContinue,
  locationSelected = false
}: VehicleSelectionSectionProps) {
  const isMobile = useIsMobile();

  // If no location is selected yet
  if (!locationSelected) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Select Vehicle(s)
          </Label>
          
          <ScaleIn className="mt-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a location first to view available vehicles
              </AlertDescription>
            </Alert>
          </ScaleIn>
        </div>
      </div>
    );
  }
  
  if (vehicles.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <Label className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Select Vehicle(s)
          </Label>
          
          <ScaleIn className="mt-2">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No vehicles found at this location. Please add vehicles to this location first.
              </AlertDescription>
            </Alert>
          </ScaleIn>
          
          <AnimatedButton className="mt-4" variant="outline" onClick={onCancel}>
            Go Back
          </AnimatedButton>
        </div>
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
        <StaggeredChildren staggerMs={80} className="grid grid-cols-1 gap-2 mt-2">
          {vehicles.map((vehicle) => (
            <VehicleSelectionTab
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicleIds.includes(vehicle.id)}
              onSelect={() => onSelectVehicle(vehicle.id)}
              showWashHistory={true}
            />
          ))}
        </StaggeredChildren>
      </div>
      
      {selectedVehicleIds.length > 0 && onContinue && (
        <PulseSoft className="transition-all duration-300 transform">
          <AnimatedButton 
            type="button" 
            className={cn(
              "w-full transition-all duration-300",
              selectedVehicleIds.length > 0 ? "opacity-100" : "opacity-70"
            )}
            onClick={onContinue}
          >
            Continue to Date Selection
            <ArrowRight className="h-4 w-4 ml-2" />
          </AnimatedButton>
        </PulseSoft>
      )}
    </div>
  );
}
