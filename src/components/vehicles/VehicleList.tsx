import React, { useState, useEffect } from "react";
import { VehicleCard } from "./VehicleCard";
import { supabase } from "@/integrations/supabase/client";
import { useVehicles } from "@/contexts/VehicleContext";
import { useLocations } from "@/contexts/LocationContext";
import { SearchVehicles } from "./SearchVehicles";
import { VehicleFilters } from "./VehicleFilters";
import { Location, Vehicle } from "@/models/types";
import { differenceInDays } from "date-fns";

interface VehicleListProps {
  onAddVehicle: () => void;
  onSelectVehicle: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortOption = 'lastWash' | 'make' | 'model' | 'year' | 'dateAdded' | 'location';
type FilterOption = 'all' | 'washed' | 'unwashed';

export function VehicleList({
  onAddVehicle,
  onSelectVehicle,
  searchQuery,
  onSearchChange,
}: VehicleListProps) {
  const { vehicles } = useVehicles();
  const { locations } = useLocations();
  const [vehicleLocations, setVehicleLocations] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [lastWashDates, setLastWashDates] = useState<Record<string, Date>>({});

  useEffect(() => {
    const fetchVehicleLocations = async () => {
      const { data, error } = await supabase
        .from('location_vehicles')
        .select('vehicle_id, location_id');
      
      if (data) {
        const locationMap: Record<string, string> = {};
        
        data.forEach(item => {
          locationMap[item.vehicle_id] = item.location_id;
        });
        
        setVehicleLocations(locationMap);
      }
      
      if (error) {
        console.error("Error fetching vehicle locations:", error);
      }
    };
    
    fetchVehicleLocations();
  }, [vehicles]);

  useEffect(() => {
    const fetchLastWashDates = async () => {
      const vehicleIds = vehicles.map(v => v.id);
      
      const { data, error } = await supabase
        .from('vehicle_wash_statuses')
        .select('vehicle_id, created_at')
        .in('vehicle_id', vehicleIds)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      if (data) {
        const dates: Record<string, Date> = {};
        data.forEach(status => {
          if (!dates[status.vehicle_id]) {
            dates[status.vehicle_id] = new Date(status.created_at);
          }
        });
        setLastWashDates(dates);
      }
    };

    fetchLastWashDates();
  }, [vehicles]);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = searchQuery.toLowerCase().trim() === '' || 
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.year.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.color?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = !selectedLocationId || vehicleLocations[vehicle.id] === selectedLocationId;

    if (!matchesSearch || !matchesLocation) return false;

    const lastWashDate = lastWashDates[vehicle.id];
    const daysSinceWash = lastWashDate ? differenceInDays(new Date(), lastWashDate) : null;

    switch (filterBy) {
      case 'washed':
        return daysSinceWash !== null && daysSinceWash <= 7;
      case 'unwashed':
        return daysSinceWash === null || daysSinceWash > 7;
      default:
        return true;
    }
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'location': {
        const locA = locations.find(loc => loc.id === vehicleLocations[a.id])?.name || '';
        const locB = locations.find(loc => loc.id === vehicleLocations[b.id])?.name || '';
        return locA.localeCompare(locB);
      }
      case 'lastWash': {
        const dateA = lastWashDates[a.id];
        const dateB = lastWashDates[b.id];
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      }
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
    <div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <SearchVehicles 
            searchQuery={searchQuery} 
            onSearchChange={onSearchChange} 
          />
        </div>
        <VehicleFilters
          sortBy={sortBy}
          filterBy={filterBy}
          selectedLocationId={selectedLocationId}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
          onLocationChange={setSelectedLocationId}
        />
      </div>
      
      {sortedVehicles.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground mb-4">No vehicles found</p>
          <button
            onClick={onAddVehicle}
            className="text-primary hover:underline"
          >
            Add your first vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 mt-4">
          {sortedVehicles.map((vehicle) => {
            const locationId = vehicleLocations[vehicle.id];
            const locationName = locationId ? locations.find(loc => loc.id === locationId)?.name : undefined;
            const lastWashDate = lastWashDates[vehicle.id];
            
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => onSelectVehicle(vehicle.id)}
                clickable={true}
                locationName={locationName}
                lastWashDate={lastWashDate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
