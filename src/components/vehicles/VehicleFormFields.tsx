
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface VehicleFormData {
  make: string;
  model: string;
  year: string;
  color?: string;
  type?: string;
  licensePlate?: string;
  vinNumber?: string;
}

interface VehicleFormFieldsProps {
  vehicleData: VehicleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function VehicleFormFields({
  vehicleData,
  onInputChange,
  disabled = false
}: VehicleFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
