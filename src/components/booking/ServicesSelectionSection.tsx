
import React from "react";
import { Label } from "@/components/ui/label";
import { Droplet, Check } from "lucide-react";
import { Vehicle } from "@/models/types";
import { Button } from "@/components/ui/button";
import { AVAILABLE_SERVICES } from "./services/ServiceConstants";
import { VehicleServiceCard } from "./services/VehicleServiceCard";
import { NoVehiclesSelected } from "./services/NoVehiclesSelected";

export interface VehicleService {
  vehicleId: string;
  services: string[]; // Array of service IDs
}

interface ServicesSelectionSectionProps {
  vehicles: Vehicle[];
  selectedVehicleIds: string[];
  vehicleServices: VehicleService[];
  onServiceChange: (vehicleServices: VehicleService[]) => void;
}

export function ServicesSelectionSection({
  vehicles,
  selectedVehicleIds,
  vehicleServices,
  onServiceChange
}: ServicesSelectionSectionProps) {
  // Filter vehicles to only show selected ones
  const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));

  // Helper function to check if a service is selected for a vehicle
  const isServiceSelected = (vehicleId: string, serviceId: string) => {
    const vehicleService = vehicleServices.find(vs => vs.vehicleId === vehicleId);
    return vehicleService ? vehicleService.services.includes(serviceId) : false;
  };

  // Handle service selection change
  const handleServiceChange = (vehicleId: string, serviceId: string, checked: boolean) => {
    const updatedServices = [...vehicleServices];
    const vehicleServiceIndex = updatedServices.findIndex(vs => vs.vehicleId === vehicleId);
    
    if (vehicleServiceIndex >= 0) {
      // Vehicle services already exist, update them
      const vehicleService = updatedServices[vehicleServiceIndex];
      if (checked) {
        // Add service
        updatedServices[vehicleServiceIndex] = {
          ...vehicleService,
          services: [...vehicleService.services, serviceId]
        };
      } else {
        // Remove service
        updatedServices[vehicleServiceIndex] = {
          ...vehicleService,
          services: vehicleService.services.filter(id => id !== serviceId)
        };
      }
    } else {
      // Vehicle services don't exist, create them
      updatedServices.push({
        vehicleId,
        services: checked ? [serviceId] : []
      });
    }
    
    onServiceChange(updatedServices);
  };

  // Handle select all services for a specific vehicle
  const handleSelectAllForVehicle = (vehicleId: string) => {
    const updatedServices = [...vehicleServices];
    const vehicleServiceIndex = updatedServices.findIndex(vs => vs.vehicleId === vehicleId);
    const allServiceIds = AVAILABLE_SERVICES.map(service => service.id);
    
    if (vehicleServiceIndex >= 0) {
      // Update existing vehicle services
      updatedServices[vehicleServiceIndex] = {
        ...updatedServices[vehicleServiceIndex],
        services: allServiceIds
      };
    } else {
      // Create new vehicle services entry
      updatedServices.push({
        vehicleId,
        services: allServiceIds
      });
    }
    
    onServiceChange(updatedServices);
  };

  // Handle select all services for all vehicles
  const handleSelectAllServices = () => {
    const allServiceIds = AVAILABLE_SERVICES.map(service => service.id);
    const updatedServices = selectedVehicleIds.map(vehicleId => ({
      vehicleId,
      services: allServiceIds
    }));
    
    onServiceChange(updatedServices);
  };

  // If no vehicles selected, show message
  if (selectedVehicles.length === 0) {
    return <NoVehiclesSelected />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center">
          <Droplet className="h-4 w-4 mr-2" />
          Select Services for Each Vehicle
        </Label>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAllServices}
          className="text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Select All Services
        </Button>
      </div>
      
      <div className="space-y-6">
        {selectedVehicles.map(vehicle => (
          <VehicleServiceCard
            key={vehicle.id}
            vehicle={vehicle}
            availableServices={AVAILABLE_SERVICES}
            isServiceSelected={isServiceSelected}
            onServiceChange={handleServiceChange}
            onSelectAllForVehicle={handleSelectAllForVehicle}
          />
        ))}
      </div>
    </div>
  );
}
