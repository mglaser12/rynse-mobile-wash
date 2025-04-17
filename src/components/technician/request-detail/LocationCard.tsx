
import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Location } from "@/models/types";

interface LocationCardProps {
  location: Location;
}

export const LocationCard = ({ location }: LocationCardProps) => {
  if (!location || !location.address) return null;
  
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-2">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{location.name}</h4>
          <p className="text-sm text-muted-foreground">{location.address}</p>
        </div>
      </div>
    </Card>
  );
};
