
import React from "react";
import { Vehicle } from "@/models/types";
import { Clock, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVehicleWashHistory } from "@/hooks/useVehicleWashHistory";
import { PressableTile, ScaleIn } from "@/components/ui/micro-animations";
import { cn } from "@/lib/utils";

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
    <PressableTile
      className={cn(
        "p-3 border rounded-md cursor-pointer transition-all duration-200", 
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "hover:border-primary/50 hover:bg-primary/[0.02]"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden transition-all",
          isSelected ? "ring-2 ring-primary/50" : ""
        )}>
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className={cn(
                "h-full w-full object-cover transition-transform duration-300",
                isSelected ? "scale-105" : ""
              )}
            />
          ) : (
            <Car className={cn(
              "h-6 w-6 transition-colors duration-300",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>
        <div className="flex-1">
          <h4 className={cn(
            "font-medium transition-colors duration-200", 
            isSelected ? "text-primary" : ""
          )}>
            {vehicle.make} {vehicle.model}
          </h4>
          <p className="text-sm text-muted-foreground">
            {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
          </p>
          {showWashHistory && (
            <ScaleIn className="mt-1 origin-left">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs flex items-center gap-1 transition-colors duration-300",
                  getWashStatusColor(daysSinceLastWash)
                )}
              >
                <Clock className="h-3 w-3" />
                {getWashStatusText(daysSinceLastWash)}
              </Badge>
            </ScaleIn>
          )}
        </div>
      </div>
    </PressableTile>
  );
}
