
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVehicles } from "@/contexts/VehicleContext";
import { VehicleCard } from "./VehicleCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Vehicle } from "@/models/types";
import { SearchVehicles } from "./SearchVehicles";

interface VehicleListProps {
  onAddVehicle: () => void;
  onSelectVehicle: (vehicleId: string) => void;
  selectedVehicleIds?: string[];
  selectionMode?: boolean;
  vehicles?: Vehicle[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function VehicleList({ 
  onAddVehicle, 
  onSelectVehicle,
  selectedVehicleIds = [],
  selectionMode = false,
  vehicles: propVehicles,
  searchQuery = "",
  onSearchChange
}: VehicleListProps) {
  const { vehicles: contextVehicles, isLoading } = useVehicles();
  
  // Use provided vehicles or fall back to context vehicles
  const allVehicles = propVehicles || contextVehicles;
  
  // Filter vehicles based on search query
  const filteredVehicles = searchQuery.trim() !== "" 
    ? allVehicles.filter(vehicle => {
        const query = searchQuery.toLowerCase();
        return (
          vehicle.make.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query) ||
          vehicle.year.toLowerCase().includes(query) ||
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(query)) ||
          (vehicle.color && vehicle.color.toLowerCase().includes(query)) ||
          (vehicle.type && vehicle.type.toLowerCase().includes(query)) ||
          (vehicle.vinNumber && vehicle.vinNumber.toLowerCase().includes(query))
        );
      })
    : allVehicles;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Vehicles</h3>
        <Button variant="outline" size="sm" onClick={onAddVehicle}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>
      
      {/* Add search component if onSearchChange is provided */}
      {onSearchChange && (
        <SearchVehicles 
          searchQuery={searchQuery} 
          onSearchChange={onSearchChange} 
        />
      )}
      
      {/* Remove ScrollArea and let parent handle scrolling */}
      <div className="space-y-3">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={selectedVehicleIds.includes(vehicle.id)}
              selectionMode={selectionMode}
              onClick={() => onSelectVehicle(vehicle.id)}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            {searchQuery.trim() !== "" ? (
              <div>
                <h3 className="text-muted-foreground mb-2">No vehicles match your search</h3>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            ) : (
              <>
                <h3 className="text-muted-foreground mb-2">No vehicles found</h3>
                <p className="text-sm text-muted-foreground mb-4">Add your first vehicle to get started</p>
                <Button onClick={onAddVehicle}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
