
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, SlidersHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SortOption = 'lastWash' | 'make' | 'model' | 'year' | 'dateAdded';
type FilterOption = 'all' | 'washed' | 'unwashed';

interface VehicleSelectionFiltersProps {
  onSortChange: (value: SortOption) => void;
  onFilterChange: (value: FilterOption) => void;
  sortBy: SortOption;
  filterBy: FilterOption;
}

export function VehicleSelectionFilters({
  onSortChange,
  onFilterChange,
  sortBy,
  filterBy
}: VehicleSelectionFiltersProps) {
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
