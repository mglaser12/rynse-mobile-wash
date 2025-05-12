
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Location } from "@/models/types";
import { useLocations } from "@/contexts/LocationContext";
import { Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface LocationFormProps {
  location: Location | null;
  onCancel: () => void;
  onSuccess: () => void;
}

// Create a schema for form validation
const formSchema = z.object({
  name: z.string().min(1, { message: "Location name is required" }),
  address: z.string().min(1, { message: "Street address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zipCode: z.string().min(1, { message: "Zip code is required" }),
  latitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  longitude: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  notes: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Define the form data type from the schema
type LocationFormData = z.infer<typeof formSchema>;

export function LocationForm({ location, onCancel, onSuccess }: LocationFormProps) {
  const { createLocation, updateLocation } = useLocations();
  const { user } = useAuth();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Set up form with zod resolver
  const form = useForm<LocationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      latitude: "",
      longitude: "",
      notes: "",
      isDefault: false,
    },
  });
  
  // Destructure form methods
  const { reset, setValue, watch, formState: { isSubmitting } } = form;
  
  // Watch latitude and longitude
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  
  // When the dialog opens/closes or location changes, reset the form
  useEffect(() => {
    if (location) {
      // Edit mode - populate form with location data
      reset({
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        latitude: location.latitude ? String(location.latitude) : "",
        longitude: location.longitude ? String(location.longitude) : "",
        notes: location.notes || "",
        isDefault: location.isDefault,
      });
    } else {
      // Add mode - reset form to defaults
      reset({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        latitude: "",
        longitude: "",
        notes: "",
        isDefault: false,
      });
    }
  }, [location, reset]);
  
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
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          latitude: data.latitude,
          longitude: data.longitude,
          notes: data.notes,
          isDefault: data.isDefault,
          organizationId: user?.organizationId || ""
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  // Get current location using browser geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue("latitude", latitude.toString());
        setValue("longitude", longitude.toString());
        setIsGettingLocation(false);
        toast.success("Current location coordinates applied");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Failed to get your current location");
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Location Name*</FormLabel>
              <FormControl>
                <Input
                  placeholder="Main Office, Warehouse, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Street Address*</FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main St."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>City*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="City"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>State*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="State"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Zip Code*</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Coordinates</FormLabel>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <MapPin className="h-3 w-3 mr-1" />
              )}
              Use Current Location
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Latitude"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Longitude"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Optional: Add coordinates for map display
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Special instructions or details about this location..."
                  className="resize-none h-16"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 pt-2">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="cursor-pointer">Set as default location</FormLabel>
            </FormItem>
          )}
        />
        
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
    </Form>
  );
}
