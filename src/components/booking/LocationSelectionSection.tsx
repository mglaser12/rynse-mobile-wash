
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
  locations,
  selectedLocation,
  onSelectLocation
}: LocationSelectionSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <MapPin className="h-4 w-4 mr-2" />
        Wash Location
      </Label>
      <LocationSelector
        locations={locations || []}
        selectedLocation={selectedLocation}
        onSelectLocation={onSelectLocation}
      />
    </div>
  );
}
