
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useLocations } from "@/contexts/LocationContext";
import { Location } from "@/models/types";

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  color?: string;
  type?: string;
  licensePlate?: string;
  vinNumber?: string;
  locationId?: string;
}

interface VehicleFormFieldsProps {
  vehicleData: VehicleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange?: (locationId: string) => void;
  disabled?: boolean;
  showLocationField?: boolean;
  locationRequired?: boolean;
}

export function VehicleFormFields({
  vehicleData,
  onInputChange,
  onLocationChange,
  disabled = false,
  showLocationField = true,
  locationRequired = true
}: VehicleFormFieldsProps) {
  const { locations, isLoading: locationsLoading } = useLocations();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {showLocationField && (
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="locationId">Location {locationRequired && '*'}</Label>
          <Select
            disabled={disabled || locationsLoading}
            value={vehicleData.locationId}
            onValueChange={(value) => onLocationChange && onLocationChange(value)}
            required={locationRequired}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location: Location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
              {locations.length === 0 && !locationsLoading && (
                <SelectItem value="no-locations" disabled>
                  No locations available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {(vehicleData.locationId || !locationRequired) && (
        <>
          <div className="space-y-2">
            <Label htmlFor="make">Make*</Label>
            <Input
              id="make"
              name="make"
              value={vehicleData.make}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="Toyota"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Model*</Label>
            <Input
              id="model"
              name="model"
              value={vehicleData.model}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="Camry"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Year*</Label>
            <Input
              id="year"
              name="year"
              value={vehicleData.year}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="2023"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              value={vehicleData.color || ''}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="Blue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              name="type"
              value={vehicleData.type || ''}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="Sedan, SUV, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate</Label>
            <Input
              id="licensePlate"
              name="licensePlate"
              value={vehicleData.licensePlate || ''}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="ABC123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vinNumber">VIN Number</Label>
            <Input
              id="vinNumber"
              name="vinNumber"
              value={vehicleData.vinNumber || ''}
              onChange={onInputChange}
              disabled={disabled}
              placeholder="1HGBH41JXMN109186"
            />
          </div>
        </>
      )}
    </div>
  );
}
