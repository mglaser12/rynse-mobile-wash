import React from "react";
import { Vehicle } from "@/models/types";
import { Clock, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVehicleWashHistory } from "@/hooks/useVehicleWashHistory";

interface VehicleSelectionTabProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
  showWashHistory?: boolean;
}

export function VehicleSelectionTab({
  vehicle,
  isSelected,
  onSelect,
  showWashHistory = false
}: VehicleSelectionTabProps) {
  const { daysSinceLastWash } = useVehicleWashHistory(vehicle.id);
  
  const getWashStatusColor = (days: number | null) => {
    if (days === null) return "bg-gray-100 text-gray-600";
    if (days < 30) return "bg-green-50 text-green-700";
    if (days <= 45) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
  };

  const getWashStatusText = (days: number | null) => {
    if (days === null) return "Never washed";
    return `Last wash: ${days} days ago`;
  };

  return (
    <div
      className={`p-3 border rounded-md cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <Car className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">
            {vehicle.make} {vehicle.model}
          </h4>
          <p className="text-sm text-muted-foreground">
            {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
          </p>
          {showWashHistory && (
            <div className="mt-1">
              <Badge 
                variant="outline" 
                className={`text-xs flex items-center gap-1 ${getWashStatusColor(daysSinceLastWash)}`}
              >
                <Clock className="h-3 w-3" />
                {getWashStatusText(daysSinceLastWash)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
