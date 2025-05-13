
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Vehicle } from "@/models/types";
import { ServiceOption } from "./ServiceOption";

export interface ServiceOptionType {
  id: string;
  name: string;
  description: string;
}

interface VehicleServiceCardProps {
  vehicle: Vehicle;
  availableServices: ServiceOptionType[];
  isServiceSelected: (vehicleId: string, serviceId: string) => boolean;
  onServiceChange: (vehicleId: string, serviceId: string, checked: boolean) => void;
  onSelectAllForVehicle: (vehicleId: string) => void;
}

export function VehicleServiceCard({
  vehicle,
  availableServices,
  isServiceSelected,
  onServiceChange,
  onSelectAllForVehicle
}: VehicleServiceCardProps) {
  return (
    <Card key={vehicle.id} className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">
          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.color && `(${vehicle.color})`}
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSelectAllForVehicle(vehicle.id)}
        >
          Select All
        </Button>
      </div>
      
      <div className="space-y-3">
        {availableServices.map(service => (
          <ServiceOption
            key={service.id}
            id={service.id}
            name={service.name}
            description={service.description}
            checked={isServiceSelected(vehicle.id, service.id)}
            onChange={(checked) => onServiceChange(vehicle.id, service.id, checked)}
            vehicleId={vehicle.id}
          />
        ))}
      </div>
    </Card>
  );
}
