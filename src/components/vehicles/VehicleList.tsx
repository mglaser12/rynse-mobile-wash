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
      console.log("Fetching last wash dates for vehicles:", vehicles.map(v => v.id));
      const vehicleIds = vehicles.map(v => v.id);
      
      if (vehicleIds.length === 0) {
        console.log("No vehicles to fetch wash dates for");
        return;
      }

      // First, get all wash request vehicles to identify which wash requests include our vehicles
      const { data: washRequestVehiclesData, error: washRequestVehiclesError } = await supabase
        .from('wash_request_vehicles')
        .select('wash_request_id, vehicle_id')
        .in('vehicle_id', vehicleIds);

      if (washRequestVehiclesError) {
        console.error("Error fetching wash request vehicles:", washRequestVehiclesError);
        return;
      }

      if (!washRequestVehiclesData || washRequestVehiclesData.length === 0) {
        console.log("No wash requests found for any vehicles");
        return;
      }

      console.log(`Found ${washRequestVehiclesData.length} wash request mappings for vehicles`);
      
      // Get unique wash request IDs that include our vehicles
      const washRequestIds = [...new Set(washRequestVehiclesData.map(item => item.wash_request_id))];
      
      // Now get all completed wash requests
      const { data: washRequestsData, error: washRequestsError } = await supabase
        .from('wash_requests')
        .select('id, updated_at')
        .in('id', washRequestIds)
        .eq('status', 'completed');

      if (washRequestsError) {
        console.error("Error fetching completed wash requests:", washRequestsError);
        return;
      }

      if (!washRequestsData || washRequestsData.length === 0) {
        console.log("No completed wash requests found");
        return;
      }

      console.log(`Found ${washRequestsData.length} completed wash requests`);

      // Create a mapping of wash request IDs to their dates
      const washRequestDates = washRequestsData.reduce((acc, req) => {
        acc[req.id] = new Date(req.updated_at);
        return acc;
      }, {} as Record<string, Date>);
      
      // Now map vehicle IDs to their most recent wash dates
      const vehicleWashDates: Record<string, Date> = {};
      
      washRequestVehiclesData.forEach(mapping => {
        const washDate = washRequestDates[mapping.wash_request_id];
        if (washDate) {
          const vehicleId = mapping.vehicle_id;
          // Keep only the most recent wash date for each vehicle
          if (!vehicleWashDates[vehicleId] || washDate > vehicleWashDates[vehicleId]) {
            vehicleWashDates[vehicleId] = washDate;
          }
        }
      });
      
      console.log("Vehicle wash dates:", vehicleWashDates);
      setLastWashDates(vehicleWashDates);
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

    console.log(`Filtering vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.id})`);
    console.log(`- Last wash date: ${lastWashDate ? lastWashDate.toLocaleDateString() : 'Never washed'}`);
    console.log(`- Days since last wash: ${daysSinceWash !== null ? daysSinceWash : 'N/A'}`);
    
    let filterResult = false;
    switch (filterBy) {
      case 'washed':
        filterResult = daysSinceWash !== null && daysSinceWash <= 30;
        console.log(`- "Recently Washed" filter result: ${filterResult} (needs to be <= 30 days)`);
        return filterResult;
      case 'unwashed':
        filterResult = daysSinceWash === null || daysSinceWash > 30;
        console.log(`- "Needs Washing" filter result: ${filterResult} (needs to be > 30 days or never washed)`);
        return filterResult;
      default:
        console.log('- No wash status filter applied');
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
          filterBy={filterBy}
          selectedLocationId={selectedLocationId}
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
