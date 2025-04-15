
import React, { createContext, useState, useContext, useEffect } from "react";
import { WashRequest, WashLocation, WashStatus, Vehicle } from "../models/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

interface WashContextType {
  washRequests: WashRequest[];
  locations: WashLocation[];
  isLoading: boolean;
  createWashRequest: (requestData: CreateWashRequestData) => Promise<WashRequest | null>;
  updateWashRequest: (id: string, data: Partial<WashRequest>) => Promise<boolean>;
  removeWashRequest: (id: string) => Promise<void>;
  getWashRequestById: (id: string) => WashRequest | undefined;
  cancelWashRequest: (id: string) => Promise<boolean>;
}

interface CreateWashRequestData {
  customerId: string;
  vehicles: string[];
  location: WashLocation;
  preferredDates: {
    start: Date;
    end?: Date;
  };
  price: number;
  notes?: string;
}

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWash() {
  return useContext(WashContext);
}

// Create an alias for backward compatibility with existing components
export const useWashRequests = useWash;

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [locations, setLocations] = useState<WashLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wash requests from Supabase when user changes
  useEffect(() => {
    const loadWashRequests = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          setWashRequests([]);
          return;
        }

        const { data: requestsData, error: requestsError } = await supabase
          .from('wash_requests')
          .select('*, wash_request_vehicles(vehicle_id)')
          .eq('user_id', user.id);

        if (requestsError) {
          console.error("Error loading wash requests from Supabase:", requestsError);
          toast.error("Failed to load wash requests");
          return;
        }

        // Load locations for these requests
        const locationIds = [...new Set(requestsData.map(req => req.location_id))];
        const { data: locationsData, error: locationsError } = await supabase
          .from('wash_locations')
          .select('*')
          .in('id', locationIds);

        if (locationsError) {
          console.error("Error loading locations from Supabase:", locationsError);
          toast.error("Failed to load locations");
          return;
        }

        // Map Supabase data to our WashRequest type
        const transformedWashRequests: WashRequest[] = requestsData.map(washRequest => {
          // Find the location for this request
          const locationData = locationsData.find(loc => loc.id === washRequest.location_id);
          const location: WashLocation = {
            id: locationData.id,
            name: locationData.name,
            address: locationData.address,
            city: locationData.city,
            state: locationData.state,
            zipCode: locationData.zip_code,
            coordinates: locationData.latitude && locationData.longitude ? {
              latitude: locationData.latitude,
              longitude: locationData.longitude
            } : undefined
          };

          // Get vehicle IDs for this request
          const vehicleIds = washRequest.wash_request_vehicles 
            ? washRequest.wash_request_vehicles.map((item: any) => item.vehicle_id)
            : [];

          return {
            id: washRequest.id,
            customerId: washRequest.user_id,
            vehicles: vehicleIds,
            location: location,
            preferredDates: {
              start: new Date(washRequest.preferred_date_start),
              end: washRequest.preferred_date_end ? new Date(washRequest.preferred_date_end) : undefined
            },
            status: washRequest.status as WashStatus,
            technician: washRequest.technician_id || undefined,
            price: Number(washRequest.price),
            notes: washRequest.notes || '',
            createdAt: new Date(washRequest.created_at),
            updatedAt: new Date(washRequest.updated_at)
          };
        });

        setWashRequests(transformedWashRequests);
      } catch (error) {
        console.error("Error in loadWashRequests:", error);
        toast.error("Failed to load wash requests");
      } finally {
        setIsLoading(false);
      }
    };

    loadWashRequests();
  }, [user]);

  // Load locations from Supabase on mount
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('wash_locations')
          .select('*');

        if (error) {
          console.error("Error loading locations from Supabase:", error);
          toast.error("Failed to load locations");
          return;
        }

        // Map Supabase data to our WashLocation type
        const transformedLocations: WashLocation[] = data.map(location => ({
          id: location.id,
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zip_code,
          coordinates: location.latitude && location.longitude ? {
            latitude: location.latitude,
            longitude: location.longitude
          } : undefined
        }));

        setLocations(transformedLocations);
      } catch (error) {
        console.error("Error in loadLocations:", error);
        toast.error("Failed to load locations");
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  // Create a new wash request
  const createWashRequest = async (requestData: CreateWashRequestData): Promise<WashRequest | null> => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a wash request");
        return null;
      }

      // Insert wash request in Supabase
      const { data, error } = await supabase
        .from('wash_requests')
        .insert({
          user_id: user.id,
          location_id: requestData.location.id,
          preferred_date_start: requestData.preferredDates.start.toISOString(),
          preferred_date_end: requestData.preferredDates.end?.toISOString(),
          notes: requestData.notes,
          price: requestData.price,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating wash request in Supabase:", error);
        toast.error("Failed to create wash request");
        return null;
      }

      // Add vehicle associations
      for (const vehicleId of requestData.vehicles) {
        const { error: vehicleError } = await supabase
          .from('wash_request_vehicles')
          .insert({
            wash_request_id: data.id,
            vehicle_id: vehicleId
          });

        if (vehicleError) {
          console.error("Error linking vehicle to wash request:", vehicleError);
          // Continue with other vehicles even if one fails
        }
      }

      // Create WashRequest object from response
      const newRequest: WashRequest = {
        id: data.id,
        customerId: data.user_id,
        vehicles: requestData.vehicles,
        location: requestData.location,
        preferredDates: {
          start: new Date(data.preferred_date_start),
          end: data.preferred_date_end ? new Date(data.preferred_date_end) : undefined,
        },
        status: data.status as WashStatus,
        technician: data.technician_id || undefined,
        price: Number(data.price),
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      // Update local state
      setWashRequests(prev => [...prev, newRequest]);
      toast.success("Wash request created successfully!");
      return newRequest;
    } catch (error) {
      console.error("Error in createWashRequest:", error);
      toast.error("Failed to create wash request");
      return null;
    }
  };

  // Update an existing wash request
  const updateWashRequest = async (id: string, data: Partial<WashRequest>): Promise<boolean> => {
    try {
      // Map our data model to Supabase model
      const updateData: any = {};
      
      if (data.location) {
        updateData.location_id = data.location.id;
      }
      
      if (data.preferredDates?.start) {
        updateData.preferred_date_start = data.preferredDates.start.toISOString();
      }
      
      if (data.preferredDates?.end) {
        updateData.preferred_date_end = data.preferredDates.end.toISOString();
      }
      
      if (data.technician !== undefined) {
        updateData.technician_id = data.technician;
      }
      
      if (data.price !== undefined) {
        updateData.price = data.price;
      }
      
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }
      
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      
      updateData.updated_at = new Date().toISOString();

      // Update in Supabase
      const { error } = await supabase
        .from('wash_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error("Error updating wash request in Supabase:", error);
        toast.error("Failed to update wash request");
        return false;
      }

      // Update local state
      setWashRequests(prev => prev.map(washRequest =>
        washRequest.id === id
          ? { ...washRequest, ...data, updatedAt: new Date() }
          : washRequest
      ));

      toast.success("Wash request updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
      return false;
    }
  };

  // Cancel a wash request (convenience function)
  const cancelWashRequest = async (id: string): Promise<boolean> => {
    return updateWashRequest(id, { status: "cancelled" });
  };

  // Remove a wash request
  const removeWashRequest = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('wash_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error removing wash request from Supabase:", error);
        toast.error("Failed to remove wash request");
        return;
      }

      // Update local state
      setWashRequests(prev => prev.filter(washRequest => washRequest.id !== id));
      toast.success("Wash request removed successfully!");
    } catch (error) {
      console.error("Error removing wash request:", error);
      toast.error("Failed to remove wash request");
    }
  };

  // Get a wash request by ID
  const getWashRequestById = (id: string) => {
    return washRequests.find(washRequest => washRequest.id === id);
  };

  const value = {
    washRequests,
    locations,
    isLoading,
    createWashRequest,
    updateWashRequest,
    removeWashRequest,
    getWashRequestById,
    cancelWashRequest,
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}
