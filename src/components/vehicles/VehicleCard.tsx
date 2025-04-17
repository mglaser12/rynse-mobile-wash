
import { Vehicle } from "@/models/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Car } from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
  selected?: boolean;
  selectionMode?: boolean;
  className?: string; 
  clickable?: boolean; // Added to explicitly mark a card as clickable
}

export function VehicleCard({ 
  vehicle, 
  onClick, 
  selected = false, 
  selectionMode = false,
  className = "",
  clickable = false
}: VehicleCardProps) {
  const isClickable = clickable || !!onClick;
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${selected ? 'ring-2 ring-primary' : ''} ${isClickable ? 'cursor-pointer hover:bg-accent' : ''} ${className}`}
      onClick={isClickable ? onClick : undefined}
    >
      <CardContent className="p-0">
        <div className="flex items-center p-3">
          <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center overflow-hidden">
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
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {vehicle.make} {vehicle.model}
              </h4>
              {selectionMode && (
                <div className="mr-1" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected} />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {vehicle.year} • {vehicle.color} • {vehicle.licensePlate}
            </p>
            <div className="mt-1 flex items-center">
              <Badge variant="outline" className="text-xs">
                {vehicle.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
