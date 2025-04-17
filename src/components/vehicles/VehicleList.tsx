import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { Vehicle } from "@/models/types";
import { VehicleCard } from "./VehicleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useVehicles } from "@/contexts/VehicleContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface VehicleListProps {
  onAddVehicle: () => void;
  onSelectVehicle: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function VehicleList({ onAddVehicle, onSelectVehicle, searchQuery, onSearchChange }: VehicleListProps) {
  const { vehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const isMobile = useIsMobile();
  const vehiclesPerPage = isMobile ? 6 : 9;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (selectedVehicleId) {
      setSelectionMode(true);
    } else {
      setSelectionMode(false);
    }
  }, [selectedVehicleId]);

  const handleVehicleClick = (id: string) => {
    setSelectedVehicleId(id);
    onSelectVehicle(id);
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setCurrentPage(1); // Reset to first page when search query changes
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      vehicle.make.toLowerCase().includes(searchTerm) ||
      vehicle.model.toLowerCase().includes(searchTerm) ||
      (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchTerm)) ||
      (vehicle.vinNumber && vehicle.vinNumber.toLowerCase().includes(searchTerm))
    );
  });

  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * vehiclesPerPage;
  const endIndex = startIndex + vehiclesPerPage;
  const vehiclesOnCurrentPage = filteredVehicles.slice(startIndex, endIndex);

  const SearchVehicles = useCallback(() => {
    return (
      <div className="flex items-center">
        <Input
          type="search"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="max-w-md"
        />
        <Search className="h-5 w-5 ml-3 text-gray-500" />
      </div>
    );
  }, [searchQuery, handleSearchInputChange]);

  return (
    <div>
      <header className="flex justify-between items-center mb-4">
        <SearchVehicles />
        <Button onClick={onAddVehicle} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {vehiclesOnCurrentPage.length > 0 ? (
          vehiclesOnCurrentPage.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              isSelected={selectionMode && vehicle.id === selectedVehicleId}
              onClick={() => handleVehicleClick(vehicle.id)} 
            />
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-6 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No vehicles found matching your search.</p>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="mr-2"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
