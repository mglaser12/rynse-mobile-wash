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
  const defaultLocation = locations.find(loc => loc.isDefault);
  const formatAddress = (location: Location | undefined) => {
    if (!location) return "";
    return `${location.address}, ${location.city}, ${location.state}`;
  };
  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  return <div className="space-y-2">
      <Label className="flex items-center">
        <MapPin className="h-4 w-4 mr-2" />
        Select Location
      </Label>
      
      <Select value={selectedLocationId} onValueChange={handleLocationChange}>
        <SelectTrigger className="w-full mx-0 my-0 py-[2px] px-[8px] text-base font-medium text-left rounded-sm">
          <SelectValue placeholder={defaultLocation ? `${defaultLocation.name} (Default)` : "Select a location"} />
        </SelectTrigger>
        <SelectContent position="item-aligned" side="bottom" align="start" sideOffset={5} className="w-full min-w-[250px] z-50">
          {locations.length === 0 ? <SelectItem value="no-locations" disabled>
              No locations available
            </SelectItem> : locations.map(location => <SelectItem key={location.id} value={location.id}>
                {location.name} {location.isDefault && "(Default)"}
              </SelectItem>)}
        </SelectContent>
      </Select>

      {selectedLocation && <div className="mt-2 text-sm text-muted-foreground pl-1">
          {formatAddress(selectedLocation)}
        </div>}
    </div>;
}