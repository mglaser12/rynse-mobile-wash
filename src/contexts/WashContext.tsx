
import React, { createContext, useState, useContext, useEffect } from "react";
import { WashRequest, WashLocation, WashStatus, SupabaseLocation } from "../models/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

interface WashContextType {
  washRequests: WashRequest[];
  locations: WashLocation[];
  isLoading: boolean;
  createWashRequest: (request: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => Promise<void>;
  updateWashRequest: (id: string, data: Partial<WashRequest>) => Promise<void>;
  cancelWashRequest: (id: string) => Promise<void>;
  getWashRequestById: (id: string) => WashRequest | undefined;
  getFilteredRequests: (status?: WashStatus, technicianId?: string) => WashRequest[];
}

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWashRequests() {
  return useContext(WashContext);
}

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [locations, setLocations] = useState<WashLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all wash locations once on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('wash_locations')
          .select('*');

        if (error) {
          console.error("Error loading locations from Supabase:", error);
          toast.error("Failed to load service locations");
          return;
        }

        // Map Supabase data to our WashLocation type
        const transformedLocations: WashLocation[] = data.map((loc: SupabaseLocation) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          city: loc.city,
          state: loc.state,
          zipCode: loc.zip_code,
          coordinates: loc.latitude && loc.longitude 
            ? { 
                latitude: loc.latitude, 
                longitude: loc.longitude 
              } 
            : undefined
        }));

        setLocations(transformedLocations);
      } catch (error) {
        console.error("Error in loadLocations:", error);
        toast.error("Failed to load wash locations");
      }
    };

    loadLocations();
  }, []);

  // Load wash requests when user changes
  useEffect(() => {
    const loadWashRequests = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          setWashRequests([]);
          return;
        }

        // Query to get wash requests
        const { data: requestsData, error: requestsError } = await supabase
          .from('wash_requests')
          .select(`
            *,
            wash_location:location_id(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.error("Error loading wash requests from Supabase:", requestsError);
          toast.error("Failed to load wash requests");
          setIsLoading(false);
          return;
        }

        // Get all vehicle associations for these requests
        const requestIds = requestsData.map((req: any) => req.id);
        
        const { data: vehicleAssociations, error: vehicleError } = await supabase
          .from('wash_request_vehicles')
          .select('*')
          .in('wash_request_id', requestIds);

        if (vehicleError) {
          console.error("Error loading wash request vehicles:", vehicleError);
        }

        // Create a map of request ID to vehicle IDs
        const requestVehiclesMap: Record<string, string[]> = {};
        vehicleAssociations?.forEach((association: any) => {
          if (!requestVehiclesMap[association.wash_request_id]) {
            requestVehiclesMap[association.wash_request_id] = [];
          }
          requestVehiclesMap[association.wash_request_id].push(association.vehicle_id);
        });

        // Transform data to our model
        const transformedRequests: WashRequest[] = requestsData.map((req: any) => {
          // Map location data
          const location: WashLocation = {
            id: req.wash_location.id,
            name: req.wash_location.name,
            address: req.wash_location.address,
            city: req.wash_location.city,
            state: req.wash_location.state,
            zipCode: req.wash_location.zip_code,
            coordinates: req.wash_location.latitude && req.wash_location.longitude
              ? {
                  latitude: req.wash_location.latitude,
                  longitude: req.wash_location.longitude
                }
              : undefined
          };

          return {
            id: req.id,
            customerId: req.user_id,
            location: location,
            vehicles: requestVehiclesMap[req.id] || [],
            preferredDates: {
              start: new Date(req.preferred_date_start),
              end: req.preferred_date_end ? new Date(req.preferred_date_end) : undefined
            },
            status: req.status as WashStatus,
            technician: req.technician_id,
            price: parseFloat(req.price),
            notes: req.notes,
            createdAt: new Date(req.created_at),
            updatedAt: new Date(req.updated_at)
          };
        });

        setWashRequests(transformedRequests);
      } catch (error) {
        console.error("Error in loadWashRequests:", error);
        toast.error("Failed to load wash requests");
      } finally {
        setIsLoading(false);
      }
    };

    loadWashRequests();
  }, [user]);

  // Create a new wash request
  const createWashRequest = async (requestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("You must be logged in to create a wash request");
      return;
    }

    try {
      const { customerId, location, preferredDates, vehicles, price, notes } = requestData;
      
      // Insert wash request in Supabase
      const { data: requestData, error: requestError } = await supabase
        .from('wash_requests')
        .insert({
          user_id: user.id,
          location_id: location.id,
          preferred_date_start: preferredDates.start.toISOString(),
          preferred_date_end: preferredDates.end?.toISOString(),
          status: 'pending',
          price: price,
          notes: notes
        })
        .select('*')
        .single();

      if (requestError) {
        console.error("Error creating wash request in Supabase:", requestError);
        toast.error("Failed to create wash request");
        return;
      }

      // Associate vehicles with the request
      if (vehicles.length > 0) {
        const vehicleAssociations = vehicles.map(vehicleId => ({
          wash_request_id: requestData.id,
          vehicle_id: vehicleId
        }));

        const { error: associationError } = await supabase
          .from('wash_request_vehicles')
          .insert(vehicleAssociations);

        if (associationError) {
          console.error("Error associating vehicles with wash request:", associationError);
          toast.error("Failed to associate vehicles with request");
        }
      }

      // Fetch the newly created request with its location
      const { data: newRequest, error: fetchError } = await supabase
        .from('wash_requests')
        .select(`
          *,
          wash_location:location_id(*)
        `)
        .eq('id', requestData.id)
        .single();

      if (fetchError) {
        console.error("Error fetching created wash request:", fetchError);
      } else {
        // Transform to our model and add to state
        const washLocation: WashLocation = {
          id: newRequest.wash_location.id,
          name: newRequest.wash_location.name,
          address: newRequest.wash_location.address,
          city: newRequest.wash_location.city,
          state: newRequest.wash_location.state,
          zipCode: newRequest.wash_location.zip_code,
          coordinates: newRequest.wash_location.latitude && newRequest.wash_location.longitude
            ? {
                latitude: newRequest.wash_location.latitude,
                longitude: newRequest.wash_location.longitude
              }
            : undefined
        };

        const newWashRequest: WashRequest = {
          id: newRequest.id,
          customerId: newRequest.user_id,
          location: washLocation,
          vehicles: vehicles,
          preferredDates: {
            start: new Date(newRequest.preferred_date_start),
            end: newRequest.preferred_date_end ? new Date(newRequest.preferred_date_end) : undefined
          },
          status: newRequest.status as WashStatus,
          technician: newRequest.technician_id,
          price: parseFloat(newRequest.price),
          notes: newRequest.notes,
          createdAt: new Date(newRequest.created_at),
          updatedAt: new Date(newRequest.updated_at)
        };
        
        setWashRequests(prev => [newWashRequest, ...prev]);
      }
      
      toast.success("Wash request created successfully!");
    } catch (error) {
      console.error("Error creating wash request:", error);
      toast.error("Failed to create wash request");
    }
  };

  // Update an existing wash request
  const updateWashRequest = async (id: string, data: Partial<WashRequest>) => {
    try {
      // Map our data model to Supabase model
      const updateData: Record<string, any> = {};
      
      if (data.location) updateData.location_id = data.location.id;
      if (data.preferredDates?.start) updateData.preferred_date_start = data.preferredDates.start.toISOString();
      if (data.preferredDates?.end) updateData.preferred_date_end = data.preferredDates.end.toISOString();
      if (data.status) updateData.status = data.status;
      if (data.technician !== undefined) updateData.technician_id = data.technician;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.notes !== undefined) updateData.notes = data.notes;
      
      updateData.updated_at = new Date().toISOString();

      // Update request in Supabase
      const { error } = await supabase
        .from('wash_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error("Error updating wash request in Supabase:", error);
        toast.error("Failed to update wash request");
        return;
      }

      // If vehicles array changed, update vehicle associations
      if (data.vehicles) {
        // Delete existing associations
        const { error: deleteError } = await supabase
          .from('wash_request_vehicles')
          .delete()
          .eq('wash_request_id', id);

        if (deleteError) {
          console.error("Error deleting previous vehicle associations:", deleteError);
        }

        // Create new associations
        if (data.vehicles.length > 0) {
          const vehicleAssociations = data.vehicles.map(vehicleId => ({
            wash_request_id: id,
            vehicle_id: vehicleId
          }));

          const { error: insertError } = await supabase
            .from('wash_request_vehicles')
            .insert(vehicleAssociations);

          if (insertError) {
            console.error("Error creating new vehicle associations:", insertError);
          }
        }
      }

      // Update local state
      setWashRequests(prev => 
        prev.map(request => {
          if (request.id === id) {
            return { 
              ...request, 
              ...data,
              updatedAt: new Date() 
            };
          }
          return request;
        })
      );
      
      toast.success("Wash request updated successfully!");
    } catch (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
    }
  };

  // Cancel a wash request
  const cancelWashRequest = async (id: string) => {
    try {
      // Update status in Supabase
      const { error } = await supabase
        .from('wash_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Error cancelling wash request in Supabase:", error);
        toast.error("Failed to cancel wash request");
        return;
      }

      // Update local state
      setWashRequests(prev => 
        prev.map(request => 
          request.id === id 
            ? { ...request, status: 'cancelled' as WashStatus, updatedAt: new Date() } 
            : request
        )
      );
      
      toast.success("Wash request cancelled");
    } catch (error) {
      console.error("Error cancelling wash request:", error);
      toast.error("Failed to cancel wash request");
    }
  };

  // Get a wash request by ID
  const getWashRequestById = (id: string) => {
    return washRequests.find(request => request.id === id);
  };

  // Get filtered requests based on status and/or technician
  const getFilteredRequests = (status?: WashStatus, technicianId?: string) => {
    return washRequests.filter(request => {
      let statusMatch = true;
      let techMatch = true;
      
      if (status) {
        statusMatch = request.status === status;
      }
      
      if (technicianId) {
        techMatch = request.technician === technicianId;
      }
      
      return statusMatch && techMatch;
    });
  };

  const value = {
    washRequests,
    locations,
    isLoading,
    createWashRequest,
    updateWashRequest,
    cancelWashRequest,
    getWashRequestById,
    getFilteredRequests,
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}
