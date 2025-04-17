import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Location } from "@/models/types";
import { mapSupabaseLocation } from "./mappers";
import { getVehiclesForLocation } from "./locationVehicleOperations";

export function useLocationOperations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [defaultLocation, setDefaultLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load locations from Supabase
  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get locations from Supabase
      const { data: locationsData, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
        
      if (error) {
        throw error;
      }

      // Map Supabase locations to our Location type
      const mappedLocations: Location[] = await Promise.all(
        locationsData.map(async (location) => {
          // Get vehicle count for this location
          const vehicleIds = await getVehiclesForLocation(location.id);
          const locationObj = mapSupabaseLocation(location);
          return {
            ...locationObj,
            vehicleCount: vehicleIds.length
          };
        })
      );
      
      // Find default location
      const defaultLoc = mappedLocations.find(loc => loc.isDefault) || null;
      
      setLocations(mappedLocations);
      setDefaultLocation(defaultLoc);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new location
  const createLocation = useCallback(async (
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt" | "createdBy" | "vehicleCount">
  ) => {
    try {
      // Add location to Supabase
      const { data, error } = await supabase
        .from('locations')
        .insert({
          name: locationData.name,
          address: locationData.address,
          city: locationData.city,
          state: locationData.state,
          zip_code: locationData.zipCode,
          notes: locationData.notes,
          is_default: locationData.isDefault,
          organization_id: locationData.organizationId,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        })
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }

      // Map Supabase location to our Location type
      const newLocation = mapSupabaseLocation(data);
      
      // If this is the default location, update any other locations to not be default
      if (locationData.isDefault) {
        await updateOtherLocationsToNonDefault(newLocation.id);
      }
      
      // Update local state
      await loadLocations();
      
      toast.success("Location created successfully");
      return newLocation;
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location");
      return null;
    }
  }, [loadLocations]);

  // Update an existing location
  const updateLocation = useCallback(async (
    id: string,
    locationData: Partial<Location>
  ) => {
    try {
      // Convert our Location type to Supabase format
      const supabaseData: any = {
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        zip_code: locationData.zipCode,
        notes: locationData.notes,
        is_default: locationData.isDefault,
        organization_id: locationData.organizationId,
        updated_at: new Date().toISOString(),
      };
      
      // Remove undefined fields
      Object.keys(supabaseData).forEach(key => 
        supabaseData[key] === undefined && delete supabaseData[key]
      );
      
      // Update location in Supabase
      const { error } = await supabase
        .from('locations')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // If this is now the default location, update other locations to non-default
      if (locationData.isDefault) {
        await updateOtherLocationsToNonDefault(id);
      }
      
      // Update local state
      await loadLocations();
      
      toast.success("Location updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
      return false;
    }
  }, [loadLocations]);

  // Delete a location
  const deleteLocation = useCallback(async (id: string) => {
    try {
      // First check if this is the default location
      const locationToDelete = locations.find(loc => loc.id === id);
      if (locationToDelete?.isDefault) {
        toast.error("Cannot delete the default location");
        return false;
      }
      
      // Delete location from Supabase
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setLocations(prev => prev.filter(loc => loc.id !== id));
      
      toast.success("Location deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
      return false;
    }
  }, [locations]);

  // Set location as default
  const setLocationAsDefault = useCallback(async (id: string) => {
    try {
      // Update this location to be default
      const { error } = await supabase
        .from('locations')
        .update({ is_default: true })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update all other locations to not be default
      await updateOtherLocationsToNonDefault(id);
      
      // Update local state
      await loadLocations();
      
      toast.success("Default location updated");
      return true;
    } catch (error) {
      console.error("Error setting default location:", error);
      toast.error("Failed to update default location");
      return false;
    }
  }, [loadLocations]);

  // Helper function to update all other locations to not be default
  const updateOtherLocationsToNonDefault = async (currentLocationId: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ is_default: false })
        .neq('id', currentLocationId);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating other locations:", error);
      throw error;
    }
  };

  // Get location by ID
  const getLocationById = useCallback((id: string) => {
    return locations.find(loc => loc.id === id);
  }, [locations]);

  // Refresh locations data
  const refreshLocations = useCallback(() => {
    return loadLocations();
  }, [loadLocations]);

  return {
    locations,
    defaultLocation,
    isLoading,
    loadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    setLocationAsDefault,
    getLocationById,
    refreshLocations
  };
}
