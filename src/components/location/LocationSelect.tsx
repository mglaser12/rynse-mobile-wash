
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocations } from "@/contexts/LocationContext";
import { MapPin, Loader2 } from "lucide-react";
import { getLocationForVehicle, assignVehicleToLocation, removeVehicleFromLocation } from "@/contexts/location/locationVehicleOperations";

interface LocationSelectProps {
  vehicleId: string;
  onLocationAssigned?: (locationId: string) => void;
  className?: string;
}

export function LocationSelect({ vehicleId, onLocationAssigned, className = "" }: LocationSelectProps) {
  const { locations, isLoading } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Load the current location for this vehicle when component mounts
  useEffect(() => {
    if (vehicleId) {
      const loadVehicleLocation = async () => {
        const locationId = await getLocationForVehicle(vehicleId);
        if (locationId) {
          setSelectedLocationId(locationId);
        }
      };
      
      loadVehicleLocation();
    }
  }, [vehicleId]);

  // Handle location change
  const handleLocationChange = async (value: string) => {
    if (!vehicleId) return;
    
    setIsSaving(true);
    
    try {
      if (value === "none") {
        // Remove vehicle from current location if any
        if (selectedLocationId) {
          await removeVehicleFromLocation(vehicleId, selectedLocationId);
        }
        setSelectedLocationId("");
      } else {
        // Assign vehicle to new location
        const success = await assignVehicleToLocation(vehicleId, value);
        if (success) {
          setSelectedLocationId(value);
          if (onLocationAssigned) {
            onLocationAssigned(value);
          }
        }
      }
    } catch (error) {
      console.error("Error changing vehicle location:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading locations...
      </div>
    );
  }

  return (
    <Select 
      value={selectedLocationId || "none"}
      onValueChange={handleLocationChange} 
      disabled={isSaving}
    >
      <SelectTrigger className={`${className} ${isSaving ? 'opacity-70' : ''}`}>
        <div className="flex items-center">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          <SelectValue placeholder="Select location" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No location assigned</SelectItem>
        {locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            {location.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
