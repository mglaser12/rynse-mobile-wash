
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, MapPin } from "lucide-react";

interface VehicleFiltersProps {
  onFilterChange: (value: FilterOption) => void;
  onLocationChange: (locationId: string | null) => void;
  selectedLocationId: string | null;
  filterBy: FilterOption;
}

type FilterOption = 'all' | 'washed' | 'unwashed';

export function VehicleFilters({ 
  onFilterChange, 
  onLocationChange,
  selectedLocationId,
  filterBy 
}: VehicleFiltersProps) {
  const { locations } = useLocations();

  return (
    <div className="flex gap-2">
      <Select value={selectedLocationId || 'all'} onValueChange={(value) => onLocationChange(value === 'all' ? null : value)}>
        <SelectTrigger className="w-[180px]">
          <MapPin className="h-4 w-4 mr-2" />
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filterBy} onValueChange={(value: FilterOption) => onFilterChange(value)}>
        <SelectTrigger className="w-[140px]">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vehicles</SelectItem>
          <SelectItem value="washed">Recently Washed</SelectItem>
          <SelectItem value="unwashed">Need Washing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
