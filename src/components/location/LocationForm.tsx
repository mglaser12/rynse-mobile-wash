
import React, { useEffect } from "react";
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
import { GeocodeSearch } from "./GeocodeSearch";
import { LocationMap } from "./LocationMap";
import { useMap } from "@/contexts/MapContext";

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
  notes: z.string().optional(),
  isDefault: z.boolean().default(false),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Define the form data type from the schema
type LocationFormData = z.infer<typeof formSchema>;

export function LocationForm({ location, onCancel, onSuccess }: LocationFormProps) {
  const { createLocation, updateLocation } = useLocations();
  const { user } = useAuth();
  const { isMapAvailable } = useMap();
  
  // Set up form with zod resolver
  const form = useForm<LocationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
      isDefault: false,
      latitude: undefined,
      longitude: undefined,
    },
  });
  
  // Destructure form methods
  const { reset, formState: { isSubmitting }, watch, setValue } = form;
  
  // Watch latitude and longitude for the map preview
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  
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
        notes: location.notes || "",
        isDefault: location.isDefault,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } else {
      // Add mode - reset form to defaults
      reset({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
        isDefault: false,
        latitude: undefined,
        longitude: undefined,
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
          notes: data.notes,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: data.isDefault,
          organizationId: user?.organizationId || ""
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  // Handle result from geocoding search
  const handleGeocodeResult = (result: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => {
    setValue('address', result.address);
    setValue('city', result.city);
    setValue('state', result.state);
    setValue('zipCode', result.zipCode);
    setValue('latitude', result.latitude);
    setValue('longitude', result.longitude);
  };

  // Generate a mocked location object for map preview
  const getMapPreviewLocation = (): Location[] => {
    if (latitude && longitude) {
      return [{
        id: 'preview',
        name: watch('name') || 'New Location',
        address: watch('address'),
        city: watch('city'),
        state: watch('state'),
        zipCode: watch('zipCode'),
        latitude,
        longitude,
        isDefault: watch('isDefault'),
        createdBy: 'preview',
        createdAt: new Date(),
        updatedAt: new Date(),
      }];
    }
    return [];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-2">
        {isMapAvailable && (
          <div className="mb-4">
            <FormLabel>Find Address</FormLabel>
            <GeocodeSearch onLocationFound={handleGeocodeResult} />
          </div>
        )}
      
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

        {isMapAvailable && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <FormLabel>Map Location</FormLabel>
              <div className="text-sm text-muted-foreground">
                {latitude && longitude ? (
                  <span>Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}</span>
                ) : (
                  <span>No coordinates set</span>
                )}
              </div>
            </div>
            <LocationMap 
              locations={getMapPreviewLocation()} 
              height="h-48"
            />
          </div>
        )}
        
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
