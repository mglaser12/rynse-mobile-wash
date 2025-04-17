
import React, { useState, useEffect } from "react";
import { VehicleCard } from "./VehicleCard";
import { supabase } from "@/integrations/supabase/client";
import { useVehicles } from "@/contexts/VehicleContext";
import { useLocations } from "@/contexts/LocationContext";
import { SearchVehicles } from "./SearchVehicles";
import { Location } from "@/models/types";

interface VehicleListProps {
  onAddVehicle: () => void;
  onSelectVehicle: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function VehicleList({
  onAddVehicle,
  onSelectVehicle,
  searchQuery,
  onSearchChange,
}: VehicleListProps) {
  const { vehicles } = useVehicles();
  const { locations } = useLocations();
  const [vehicleLocations, setVehicleLocations] = useState<Record<string, string>>({});
  
  // Fetch all vehicle-location associations
  useEffect(() => {
    const fetchVehicleLocations = async () => {
      const { data, error } = await supabase
        .from('location_vehicles')
        .select('vehicle_id, location_id');
      
      if (data) {
        const locationMap: Record<string, string> = {};
        
        // Create a mapping of vehicle IDs to location IDs
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

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchTerms) ||
      vehicle.model.toLowerCase().includes(searchTerms) ||
      vehicle.year.toLowerCase().includes(searchTerms) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerms) ||
      vehicle.type?.toLowerCase().includes(searchTerms) ||
      vehicle.color?.toLowerCase().includes(searchTerms)
    );
  });

  // Function to get location name by ID
  const getLocationNameById = (locationId: string): string => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : "";
  };

  return (
    <div>
      <SearchVehicles 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange} 
      />
      
      {filteredVehicles.length === 0 ? (
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
          {filteredVehicles.map((vehicle) => {
            const locationId = vehicleLocations[vehicle.id];
            const locationName = locationId ? getLocationNameById(locationId) : undefined;
            
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => onSelectVehicle(vehicle.id)}
                clickable={true}
                locationName={locationName}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
