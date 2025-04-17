import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Location } from "@/models/types";
import { useLocations } from "@/contexts/LocationContext";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LocationFormProps {
  location: Location | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export interface LocationFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  isDefault: boolean;
}

export function LocationForm({ location, onCancel, onSuccess }: LocationFormProps) {
  const { createLocation, updateLocation } = useLocations();
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<LocationFormData>();
  
  // When the dialog opens/closes or location changes, reset the form
  useEffect(() => {
    if (location) {
      // Edit mode - populate form with location data
      setValue("name", location.name);
      setValue("address", location.address);
      setValue("city", location.city);
      setValue("state", location.state);
      setValue("zipCode", location.zipCode);
      setValue("notes", location.notes || "");
      setValue("isDefault", location.isDefault);
    } else {
      // Add mode - reset form
      reset({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
        isDefault: false
      });
    }
  }, [location, reset, setValue]);
  
  const onSubmit = async (data: LocationFormData) => {
    try {
      if (location) {
        // Update existing location
        await updateLocation(location.id, {
          ...data,
          // Keep existing location data for fields not in the form
          organizationId: location.organizationId
        });
      } else {
        // Create new location
        await createLocation({
          ...data,
          organizationId: user?.organizationId
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
      <div className="space-y-2">
        <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
          Location Name*
        </Label>
        <Input
          id="name"
          placeholder="Main Office, Warehouse, etc."
          {...register("name", { required: "Location name is required" })}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address" className={errors.address ? "text-destructive" : ""}>
          Street Address*
        </Label>
        <Input
          id="address"
          placeholder="123 Main St."
          {...register("address", { required: "Street address is required" })}
          className={errors.address ? "border-destructive" : ""}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="city" className={errors.city ? "text-destructive" : ""}>
            City*
          </Label>
          <Input
            id="city"
            placeholder="City"
            {...register("city", { required: "City is required" })}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state" className={errors.state ? "text-destructive" : ""}>
            State*
          </Label>
          <Input
            id="state"
            placeholder="State"
            {...register("state", { required: "State is required" })}
            className={errors.state ? "border-destructive" : ""}
          />
          {errors.state && (
            <p className="text-sm text-destructive">{errors.state.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="zipCode" className={errors.zipCode ? "text-destructive" : ""}>
          Zip Code*
        </Label>
        <Input
          id="zipCode"
          placeholder="12345"
          {...register("zipCode", { required: "Zip code is required" })}
          className={errors.zipCode ? "border-destructive" : ""}
        />
        {errors.zipCode && (
          <p className="text-sm text-destructive">{errors.zipCode.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Special instructions or details about this location..."
          className="resize-none h-16"
          {...register("notes")}
        />
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="isDefault" 
          {...register("isDefault")} 
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Set as default location
        </Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {location ? "Updating..." : "Creating..."}
            </>
          ) : (
            location ? "Save Changes" : "Create Location"
          )}
        </Button>
      </div>
    </form>
  );
}
