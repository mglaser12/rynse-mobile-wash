import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocations } from "@/contexts/LocationContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  type: string;
  color: string;
  vinNumber?: string;
  locationId?: string;
  assetNumber?: string; // Added assetNumber field
}

interface VehicleFormFieldsProps {
  vehicleData: VehicleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  onLocationChange?: (locationId: string) => void;
  locationRequired?: boolean;
  showLocation?: boolean;
}

export function VehicleFormFields({
  vehicleData,
  onInputChange,
  disabled = false,
  onLocationChange,
  locationRequired = false,
  showLocation = true,
}: VehicleFormFieldsProps) {
  const { locations } = useLocations();

  const handleLocationChange = (value: string) => {
    console.log("Location selected in form field:", value);
    if (onLocationChange) {
      onLocationChange(value);
    }
  };

  return (
    <>
      {onLocationChange && showLocation && (
        <div className="space-y-1.5">
          <Label htmlFor="location" className={locationRequired ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
            Location
          </Label>
          <Select
            value={vehicleData.locationId || ""}
            onValueChange={handleLocationChange}
            disabled={disabled}
          >
            <SelectTrigger id="location" className={!vehicleData.locationId && locationRequired ? "ring-1 ring-red-400" : ""}>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {locationRequired && !vehicleData.locationId && (
            <p className="text-xs text-red-500">Location is required</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="make" className="after:content-['*'] after:text-red-500 after:ml-1">
            Make
          </Label>
          <Input
            id="make"
            name="make"
            value={vehicleData.make}
            onChange={onInputChange}
            placeholder="e.g. Toyota"
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model" className="after:content-['*'] after:text-red-500 after:ml-1">
            Model
          </Label>
          <Input
            id="model"
            name="model"
            value={vehicleData.model}
            onChange={onInputChange}
            placeholder="e.g. Camry"
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="year" className="after:content-['*'] after:text-red-500 after:ml-1">
            Year
          </Label>
          <Input
            id="year"
            name="year"
            value={vehicleData.year}
            onChange={onInputChange}
            placeholder="e.g. 2023"
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="licensePlate">License Plate</Label>
          <Input
            id="licensePlate"
            name="licensePlate"
            value={vehicleData.licensePlate}
            onChange={onInputChange}
            placeholder="e.g. ABC123"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="type">Vehicle Type</Label>
          <Input
            id="type"
            name="type"
            value={vehicleData.type}
            onChange={onInputChange}
            placeholder="e.g. Sedan"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            value={vehicleData.color}
            onChange={onInputChange}
            placeholder="e.g. Red"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="vinNumber">VIN Number</Label>
          <Input
            id="vinNumber"
            name="vinNumber"
            value={vehicleData.vinNumber || ""}
            onChange={onInputChange}
            placeholder="e.g. 1HGCM82633A004352"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assetNumber">Asset Number</Label>
          <Input
            id="assetNumber"
            name="assetNumber"
            value={vehicleData.assetNumber || ""}
            onChange={onInputChange}
            placeholder="e.g. TYT-CM-12345"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}
