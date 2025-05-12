
import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Location } from "@/models/types";

// Create a more flexible interface that accepts either the full Location type
// or the simplified location object from WashRequest
interface LocationCardProps {
  location: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

export const LocationCard = ({ location }: LocationCardProps) => {
  if (!location) return null;
  
  // Format the address based on what's available
  const formattedAddress = location.address || 
    (location.city && location.state ? 
      `${location.city}, ${location.state} ${location.zipCode || ''}`.trim() : 
      undefined);
  
  if (!location.name && !formattedAddress) return null;
  
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-2">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{location.name}</h4>
          {formattedAddress && (
            <p className="text-sm text-muted-foreground">{formattedAddress}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
