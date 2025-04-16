
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Location, SupabaseLocation } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";

// Map Supabase location to our app's Location type
const mapSupabaseLocation = (data: SupabaseLocation): Location => {
  return {
    id: data.id,
    name: data.name,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    latitude: data.latitude || undefined,
    longitude: data.longitude || undefined,
    notes: data.notes || undefined,
    isDefault: data.is_default || false,
    organizationId: data.organization_id || undefined,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    vehicleCount: 0 // Will be populated in a separate query
  };
};

interface LocationContextType {
  locations: Location[];
  defaultLocation: Location | null;
  isLoading: boolean;
  createLocation: (locationData: Omit<Location, "id" | "createdAt" | "updatedAt" | "createdBy" | "vehicleCount">) => Promise<Location | null>;
  updateLocation: (id: string, locationData: Partial<Location>) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
  setDefaultLocation: (id: string) => Promise<boolean>;
  getLocationById: (id: string) => Location | undefined;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({} as LocationContextType);

export const useLocations = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [defaultLocation, setDefaultLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load locations on component mount and when user changes
  useEffect(() => {
    if (user) {
      loadLocations();
    } else {
      setLocations([]);
      setDefaultLocation(null);
    }
  }, [user]);

  // Load all locations accessible to the current user
  const loadLocations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get all locations
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (locationError) throw locationError;
      
      // Convert to our app's Location type
      const mappedLocations = locationData.map(mapSupabaseLocation);
      
      // Get vehicle counts for each location
      const updatedLocations = await Promise.all(
        mappedLocations.map(async (location) => {
          const { count, error } = await supabase
            .from('location_vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('location_id', location.id);
          
          return {
            ...location,
            vehicleCount: error ? 0 : count || 0
          };
        })
      );
      
      setLocations(updatedLocations);
      
      // Find default location
      const defaultLoc = updatedLocations.find(loc => loc.isDefault) || null;
      setDefaultLocation(defaultLoc);
      
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new location
  const createLocation = async (
    locationData: Omit<Location, "id" | "createdAt" | "updatedAt" | "createdBy" | "vehicleCount">
  ): Promise<Location | null> => {
    if (!user) {
      toast.error("You must be logged in to create a location");
      return null;
    }
    
    try {
      // Prepare data for insertion
      const insertData = {
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        zip_code: locationData.zipCode,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        notes: locationData.notes || null,
        is_default: locationData.isDefault || false,
        organization_id: locationData.organizationId || null,
        created_by: user.id
      };
      
      // Insert the new location
      const { data, error } = await supabase
        .from('locations')
        .insert(insertData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Map to our Location type
      const newLocation = mapSupabaseLocation(data);
      
      // Update state
      setLocations(prev => [...prev, { ...newLocation, vehicleCount: 0 }]);
      
      // If this is the default location, update the defaultLocation state
      if (newLocation.isDefault) {
        // First, make sure no other location is set as default
        if (defaultLocation) {
          await updateLocation(defaultLocation.id, { isDefault: false });
        }
        setDefaultLocation(newLocation);
      }
      
      toast.success("Location created successfully");
      return newLocation;
    } catch (error) {
      console.error("Error creating location:", error);
      toast.error("Failed to create location");
      return null;
    }
  };

  // Update an existing location
  const updateLocation = async (id: string, locationData: Partial<Location>): Promise<boolean> => {
    try {
      // Prepare data for update
      const updateData: any = {};
      
      if (locationData.name !== undefined) updateData.name = locationData.name;
      if (locationData.address !== undefined) updateData.address = locationData.address;
      if (locationData.city !== undefined) updateData.city = locationData.city;
      if (locationData.state !== undefined) updateData.state = locationData.state;
      if (locationData.zipCode !== undefined) updateData.zip_code = locationData.zipCode;
      if (locationData.latitude !== undefined) updateData.latitude = locationData.latitude;
      if (locationData.longitude !== undefined) updateData.longitude = locationData.longitude;
      if (locationData.notes !== undefined) updateData.notes = locationData.notes;
      if (locationData.isDefault !== undefined) updateData.is_default = locationData.isDefault;
      
      // Update the location
      const { data, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Map to our Location type
      const updatedLocation = mapSupabaseLocation(data);
      
      // Update state
      setLocations(prev => 
        prev.map(loc => 
          loc.id === id ? { ...updatedLocation, vehicleCount: loc.vehicleCount } : loc
        )
      );
      
      // Handle default location changes
      if (locationData.isDefault) {
        // If this location is now default, make sure all others are not default
        setLocations(prev => 
          prev.map(loc => 
            loc.id !== id ? { ...loc, isDefault: false } : loc
          )
        );
        setDefaultLocation({ ...updatedLocation, vehicleCount: locations.find(l => l.id === id)?.vehicleCount || 0 });
      } else if (defaultLocation?.id === id && locationData.isDefault === false) {
        // If this was the default location but no longer is
        setDefaultLocation(null);
      }
      
      toast.success("Location updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
      return false;
    }
  };

  // Delete a location
  const deleteLocation = async (id: string): Promise<boolean> => {
    try {
      // Check if there are any active wash requests using this location
      const { count, error: countError } = await supabase
        .from('wash_requests')
        .select('*', { count: 'exact', head: true })
        .eq('location_detail_id', id)
        .in('status', ['pending', 'confirmed', 'in_progress']);
      
      if (countError) throw countError;
      
      // If there are active wash requests, don't allow deletion
      if (count && count > 0) {
        toast.error("Cannot delete location with active wash requests");
        return false;
      }
      
      // Delete the location
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update state
      setLocations(prev => prev.filter(loc => loc.id !== id));
      
      // If this was the default location, reset defaultLocation
      if (defaultLocation?.id === id) {
        setDefaultLocation(null);
      }
      
      toast.success("Location deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
      return false;
    }
  };

  // Set a location as the default
  const setDefaultLocation = async (id: string): Promise<boolean> => {
    try {
      // First, unset all locations as default
      const { error: batchError } = await supabase
        .from('locations')
        .update({ is_default: false })
        .not('id', 'eq', id); // Update all except the one we're setting
      
      if (batchError) throw batchError;
      
      // Set the selected location as default
      const { data, error } = await supabase
        .from('locations')
        .update({ is_default: true })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Map to our Location type
      const updatedDefaultLocation = mapSupabaseLocation(data);
      
      // Update state
      setLocations(prev => 
        prev.map(loc => ({
          ...loc,
          isDefault: loc.id === id
        }))
      );
      
      setDefaultLocation({ 
        ...updatedDefaultLocation, 
        vehicleCount: locations.find(l => l.id === id)?.vehicleCount || 0 
      });
      
      toast.success(`${updatedDefaultLocation.name} set as default location`);
      return true;
    } catch (error) {
      console.error("Error setting default location:", error);
      toast.error("Failed to set default location");
      return false;
    }
  };

  // Get a location by ID
  const getLocationById = (id: string): Location | undefined => {
    return locations.find(loc => loc.id === id);
  };

  // Refresh locations data
  const refreshLocations = async (): Promise<void> => {
    await loadLocations();
  };

  const value = {
    locations,
    defaultLocation,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    setDefaultLocation,
    getLocationById,
    refreshLocations
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
