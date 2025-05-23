
import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Location } from "@/models/types";
import { Button } from "@/components/ui/button";

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
  
  // Open Google Maps with the address
  const handleGetDirections = () => {
    if (formattedAddress) {
      const encodedAddress = encodeURIComponent(formattedAddress);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    } else if (location.coordinates) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`, '_blank');
    }
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-2">
        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="space-y-1 flex-1">
          <h4 className="font-medium text-sm">{location.name}</h4>
          {formattedAddress && (
            <p className="text-sm text-muted-foreground">{formattedAddress}</p>
          )}
          {(formattedAddress || location.coordinates) && (
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2 w-full flex items-center justify-center"
              onClick={handleGetDirections}
            >
              <Navigation className="h-4 w-4 mr-1" />
              Get Directions
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
