
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import { VehicleSelectionFilters } from "./VehicleSelectionFilters";
import { Vehicle } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { useVehicleWashHistory } from "@/hooks/useVehicleWashHistory";

interface VehicleSelectionSectionProps {
  selectedVehicleIds: string[];
  onSelectVehicle: (id: string) => void;
  locationSelected: boolean;
}

type SortOption = 'lastWash' | 'make' | 'model' | 'year' | 'dateAdded';
type FilterOption = 'all' | 'washed' | 'unwashed';

export function VehicleSelectionSection({
  selectedVehicleIds,
  onSelectVehicle,
  locationSelected
}: VehicleSelectionSectionProps) {
  const { vehicles } = useVehicles();
  const [sortBy, setSortBy] = useState<SortOption>('lastWash');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // Get last wash dates for all vehicles
  const vehiclesWithWashDates = vehicles.map(vehicle => {
    const { lastWashDate, daysSinceLastWash } = useVehicleWashHistory(vehicle.id);
    return {
      ...vehicle,
      lastWashDate,
      daysSinceLastWash
    };
  });

  // Filter vehicles
  const filteredVehicles = vehiclesWithWashDates.filter(vehicle => {
    switch (filterBy) {
      case 'washed':
        return vehicle.daysSinceLastWash !== null && vehicle.daysSinceLastWash <= 7;
      case 'unwashed':
        return vehicle.daysSinceLastWash === null || vehicle.daysSinceLastWash > 7;
      default:
        return true;
    }
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'lastWash':
        if (!a.lastWashDate && !b.lastWashDate) return 0;
        if (!a.lastWashDate) return 1;
        if (!b.lastWashDate) return -1;
        return b.lastWashDate.getTime() - a.lastWashDate.getTime();
      case 'make':
        return a.make.localeCompare(b.make);
      case 'model':
        return a.model.localeCompare(b.model);
      case 'year':
        return b.year.localeCompare(a.year);
      case 'dateAdded':
        return b.dateAdded.getTime() - a.dateAdded.getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center">
          <Car className="h-4 w-4 mr-2" />
          Select Vehicle(s)
        </Label>
        <VehicleSelectionFilters
          sortBy={sortBy}
          filterBy={filterBy}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
        />
      </div>

      {!locationSelected ? (
        <p className="text-sm text-muted-foreground">Please select a location first</p>
      ) : sortedVehicles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No vehicles found</p>
      ) : (
        <div className="grid gap-3">
          {sortedVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={selectedVehicleIds.includes(vehicle.id)}
              selectionMode={true}
              onClick={() => onSelectVehicle(vehicle.id)}
              lastWashDate={vehicle.lastWashDate}
              clickable
            />
          ))}
        </div>
      )}
    </div>
  );
}
