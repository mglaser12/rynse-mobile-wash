import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LocationSelect } from "@/components/location/LocationSelect";

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  color: string;
  licensePlate?: string;
  vinNumber?: string;
  type?: string;
  image?: string;
}

export interface VehicleFormFieldsProps {
  vehicleData: VehicleFormData;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  vehicleId?: string;
}

export function VehicleFormFields({ 
  vehicleData, 
  onInputChange, 
  disabled,
  vehicleId 
}: VehicleFormFieldsProps) {
  const handleTypeChange = (value: string) => {
    const event = {
      target: {
        name: "type",
        value
      }
    } as ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="make" className="text-sm font-medium">
            Make*
          </label>
          <Input
            id="make"
            name="make"
            value={vehicleData.make}
            onChange={onInputChange}
            placeholder="Toyota, Honda, etc."
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="model" className="text-sm font-medium">
            Model*
          </label>
          <Input
            id="model"
            name="model"
            value={vehicleData.model}
            onChange={onInputChange}
            placeholder="Camry, Civic, etc."
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="year" className="text-sm font-medium">
            Year*
          </label>
          <Input
            id="year"
            name="year"
            value={vehicleData.year}
            onChange={onInputChange}
            placeholder="2023"
            disabled={disabled}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="color" className="text-sm font-medium">
            Color*
          </label>
          <Input
            id="color"
            name="color"
            value={vehicleData.color}
            onChange={onInputChange}
            placeholder="Black, White, etc."
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="licensePlate" className="text-sm font-medium">
            License Plate
          </label>
          <Input
            id="licensePlate"
            name="licensePlate"
            value={vehicleData.licensePlate || ""}
            onChange={onInputChange}
            placeholder="ABC123"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="vinNumber" className="text-sm font-medium">
            VIN Number
          </label>
          <Input
            id="vinNumber"
            name="vinNumber"
            value={vehicleData.vinNumber || ""}
            onChange={onInputChange}
            placeholder="1HGCM82633A123456"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Vehicle Type
        </label>
        <Select
          value={vehicleData.type || ""}
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedan">Sedan</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="coupe">Coupe</SelectItem>
            <SelectItem value="convertible">Convertible</SelectItem>
            <SelectItem value="hatchback">Hatchback</SelectItem>
            <SelectItem value="wagon">Wagon</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add LocationSelect if we have a vehicleId */}
      {vehicleId && (
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <LocationSelect 
            vehicleId={vehicleId}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Select where this vehicle is located
          </p>
        </div>
      )}
    </div>
  );
}
