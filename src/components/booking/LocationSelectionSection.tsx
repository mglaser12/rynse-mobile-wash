
import React from "react";
import { Label } from "@/components/ui/label";
import { Location } from "@/models/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationSelectionSectionProps {
  locations: Location[];
  selectedLocationId?: string;
  onSelectLocation: (locationId: string) => void;
}

export function LocationSelectionSection({
  locations,
  selectedLocationId,
  onSelectLocation
}: LocationSelectionSectionProps) {
  const handleLocationChange = (value: string) => {
    onSelectLocation(value);
  };

  // Find the default location if any
  const defaultLocation = locations.find(loc => loc.isDefault);

  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <MapPin className="h-4 w-4 mr-2" />
        Select Location
      </Label>
      
      <Select
        value={selectedLocationId}
        onValueChange={handleLocationChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={defaultLocation ? `${defaultLocation.name} (Default)` : "Select a location"} />
        </SelectTrigger>
        <SelectContent>
          {locations.length === 0 ? (
            <SelectItem value="no-locations" disabled>
              No locations available
            </SelectItem>
          ) : (
            locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name} {location.isDefault && "(Default)"}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedLocationId && (
        <div className="mt-1 text-sm text-muted-foreground">
          {locations.find(loc => loc.id === selectedLocationId)?.address}, 
          {locations.find(loc => loc.id === selectedLocationId)?.city}, 
          {locations.find(loc => loc.id === selectedLocationId)?.state}
        </div>
      )}
    </div>
  );
}
