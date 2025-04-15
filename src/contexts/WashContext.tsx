import React, { createContext, useState, useContext, useEffect } from "react";
import { WashRequest, Location, Vehicle } from "../models/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

interface WashContextType {
  washRequests: WashRequest[];
  locations: Location[];
  isLoading: boolean;
  createWashRequest: (requestData: CreateWashRequestData) => Promise<WashRequest | null>;
  updateWashRequest: (id: string, data: Partial<WashRequest>) => Promise<boolean>;
  removeWashRequest: (id: string) => Promise<void>;
  getWashRequestById: (id: string) => WashRequest | undefined;
}

interface CreateWashRequestData {
  locationId: string;
  vehicleIds: string[];
  preferredDateStart: Date;
  preferredDateEnd?: Date;
  notes?: string;
  price: number;
}

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWash() {
  return useContext(WashContext);
}

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
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

        const { data, error } = await supabase
          .from('wash_requests')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error loading wash requests from Supabase:", error);
          toast.error("Failed to load wash requests");
          return;
        }

        // Map Supabase data to our WashRequest type
        const transformedWashRequests: WashRequest[] = data.map(washRequest => ({
          id: washRequest.id,
          customerId: washRequest.user_id,
          locationId: washRequest.location_id,
          technicianId: washRequest.technician_id || '',
          preferredDateStart: new Date(washRequest.preferred_date_start),
          preferredDateEnd: washRequest.preferred_date_end ? new Date(washRequest.preferred_date_end) : undefined,
          notes: washRequest.notes || '',
          price: parseFloat(washRequest.price),
          status: washRequest.status,
          dateCreated: new Date(washRequest.created_at),
          dateUpdated: washRequest.updated_at ? new Date(washRequest.updated_at) : undefined,
        }));

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
          .from('locations')
          .select('*');

        if (error) {
          console.error("Error loading locations from Supabase:", error);
          toast.error("Failed to load locations");
          return;
        }

        // Map Supabase data to our Location type
        const transformedLocations: Location[] = data.map(location => ({
          id: location.id,
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zip_code,
          latitude: location.latitude,
          longitude: location.longitude,
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
          location_id: requestData.locationId,
          preferred_date_start: requestData.preferredDateStart.toISOString(),
          preferred_date_end: requestData.preferredDateEnd?.toISOString(),
          notes: requestData.notes,
          price: requestData.price.toString(), // Convert number to string here to fix the type error
          status: 'pending'
        })
        .select('*')
        .single();

      if (error) {
        console.error("Error creating wash request in Supabase:", error);
        toast.error("Failed to create wash request");
        return null;
      }

      const newRequest: WashRequest = {
        id: data.id,
        customerId: data.user_id,
        locationId: data.location_id,
        technicianId: data.technician_id || '',
        preferredDateStart: new Date(data.preferred_date_start),
        preferredDateEnd: data.preferred_date_end ? new Date(data.preferred_date_end) : undefined,
        notes: data.notes || '',
        price: parseFloat(data.price),
        status: data.status,
        dateCreated: new Date(data.created_at),
        dateUpdated: data.updated_at ? new Date(data.updated_at) : undefined,
      };

      // Add vehicle associations
      for (const vehicleId of requestData.vehicleIds) {
        const { error: vehicleError } = await supabase
          .from('wash_request_vehicles')
          .insert({
            wash_request_id: newRequest.id,
            vehicle_id: vehicleId
          });

        if (vehicleError) {
          console.error("Error linking vehicle to wash request:", vehicleError);
          // Continue with other vehicles even if one fails
        }
      }

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
      const updateData: any = {
        location_id: data.locationId,
        preferred_date_start: data.preferredDateStart?.toISOString(),
        preferred_date_end: data.preferredDateEnd?.toISOString(),
        technician_id: data.technicianId,
        price: data.price?.toString(), // Convert number to string here to fix the type error
        notes: data.notes,
        status: data.status,
        updated_at: new Date()
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key =>
        updateData[key] === undefined && delete updateData[key]
      );

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
          ? { ...washRequest, ...data }
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
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}
