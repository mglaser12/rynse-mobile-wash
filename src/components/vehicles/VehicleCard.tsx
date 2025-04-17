
import React, { useState, useEffect } from "react";
import { Car, MapPin } from "lucide-react";
import { Vehicle } from "@/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { useLocations } from "@/contexts/LocationContext";
import { getLocationForVehicle } from "@/contexts/location/locationVehicleOperations";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
  isSelected?: boolean;
}

export function VehicleCard({ vehicle, onClick, isSelected = false }: VehicleCardProps) {
  const { getLocationById } = useLocations();
  const [locationName, setLocationName] = useState<string | null>(null);

  // Get the location name for this vehicle
  useEffect(() => {
    const fetchLocation = async () => {
      const locationId = await getLocationForVehicle(vehicle.id);
      if (locationId) {
        const location = getLocationById(locationId);
        if (location) {
          setLocationName(location.name);
        }
      }
    };
    
    fetchLocation();
  }, [vehicle.id, getLocationById]);

  return (
    <Card 
      onClick={onClick}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-primary border-2' : 'border-gray-200'
      }`}
    >
      <div className="relative">
        {vehicle.image ? (
          <div className="h-40 w-full relative rounded-t-md overflow-hidden">
            <img
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          <div className="h-40 bg-slate-100 flex items-center justify-center rounded-t-md">
            <Car className="h-20 w-20 text-slate-300" />
          </div>
        )}
        
        <div className={`absolute top-2 right-2 px-2 py-1 rounded ${
          vehicle.type ? 'bg-primary/80 text-white' : 'bg-gray-200'
        }`}>
          <span className="text-xs font-medium">
            {vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : 'Unknown'}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{vehicle.make} {vehicle.model}</h3>
            <p className="text-sm text-gray-500">{vehicle.year} {vehicle.color}</p>
            
            {/* Display location if available */}
            {locationName && (
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{locationName}</span>
              </div>
            )}
          </div>
          
          {vehicle.licensePlate && (
            <div className="bg-gray-100 px-2 py-1 rounded">
              <span className="text-xs font-medium">{vehicle.licensePlate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
