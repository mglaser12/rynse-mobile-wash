
import React from "react";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { LocationSelector } from "./LocationSelector";
import { WashLocation } from "@/models/types";

interface LocationSelectionSectionProps {
  locations: WashLocation[];
  selectedLocation: WashLocation | null;
  onSelectLocation: (location: WashLocation) => void;
}

export function LocationSelectionSection({
  locations = [], // Provide default empty array
  selectedLocation,
  onSelectLocation
}: LocationSelectionSectionProps) {
  // Ensure we always pass an array to LocationSelector
  const safeLocations = Array.isArray(locations) ? locations : [];
  
  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <MapPin className="h-4 w-4 mr-2" />
        Wash Location
      </Label>
      <LocationSelector
        locations={safeLocations}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
      />
    </div>
  );
}
