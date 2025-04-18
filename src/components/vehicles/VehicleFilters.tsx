
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, ArrowUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocations } from "@/contexts/LocationContext";

type SortOption = 'lastWash' | 'make' | 'model' | 'year' | 'dateAdded' | 'location';
type FilterOption = 'all' | 'washed' | 'unwashed';

interface VehicleFiltersProps {
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  onLocationChange: (locationId: string | null) => void;
  selectedLocationId: string | null;
  sortBy: SortOption;
  filterBy: FilterOption;
}

export function VehicleFilters({ 
  onSortChange, 
  onFilterChange, 
  onLocationChange,
  selectedLocationId,
  sortBy, 
  filterBy 
}: VehicleFiltersProps) {
  const { locations } = useLocations();

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onSortChange('lastWash')}>
            Days Since Last Wash
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('location')}>
            Location
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('make')}>
            Make
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('model')}>
            Model
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('year')}>
            Year
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('dateAdded')}>
            Date Added
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Select value={selectedLocationId || ''} onValueChange={(value) => onLocationChange(value === '' ? null : value)}>
        <SelectTrigger className="w-[180px]">
          <MapPin className="h-4 w-4 mr-2" />
          <SelectValue placeholder="All Locations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Locations</SelectItem>
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
