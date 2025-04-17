
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleImageUploader } from "./VehicleImageUploader";
import { LocationSelect } from "@/components/location/LocationSelect";

interface VehicleFormFieldsProps {
  vehicleId?: string;
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  imageUrl?: string;
  handleImageChange: (imageFile: File | null) => void;
  handleImageRemove: () => void;
  isUploading: boolean;
}

export function VehicleFormFields({
  vehicleId,
  register,
  errors,
  watch,
  setValue,
  imageUrl,
  handleImageChange,
  handleImageRemove,
  isUploading,
}: VehicleFormFieldsProps) {
  // Current selected vehicle type
  const vehicleType = watch("type");

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Make*</label>
            <Input
              type="text"
              placeholder="Toyota, Honda, etc."
              {...register("make", { required: "Make is required" })}
              className={errors.make ? "border-red-500" : ""}
            />
            {errors.make && (
              <p className="text-sm text-red-500 mt-1">{errors.make.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Model*</label>
            <Input
              type="text"
              placeholder="Camry, Civic, etc."
              {...register("model", { required: "Model is required" })}
              className={errors.model ? "border-red-500" : ""}
            />
            {errors.model && (
              <p className="text-sm text-red-500 mt-1">{errors.model.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year*</label>
            <Input
              type="text"
              placeholder="2023, 2022, etc."
              {...register("year", { required: "Year is required" })}
              className={errors.year ? "border-red-500" : ""}
            />
            {errors.year && (
              <p className="text-sm text-red-500 mt-1">{errors.year.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type*</label>
            <Select
              value={vehicleType || ""}
              onValueChange={(value) => setValue("type", value)}
            >
              <SelectTrigger
                className={errors.type ? "border-red-500" : ""}
              >
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
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <Input
              type="text"
              placeholder="Blue, Red, etc."
              {...register("color")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              License Plate
            </label>
            <Input
              type="text"
              placeholder="ABC123"
              {...register("licensePlate")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">VIN Number</label>
            <Input
              type="text"
              placeholder="Vehicle Identification Number"
              {...register("vinNumber")}
            />
          </div>
          
          {/* Add location selector to VehicleFormFields if vehicle ID exists */}
          {vehicleId && (
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <LocationSelect vehicleId={vehicleId} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Vehicle Image
          </label>
          <VehicleImageUploader
            imageUrl={imageUrl}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            isUploading={isUploading}
          />
        </div>
      </div>
    </>
  );
}
