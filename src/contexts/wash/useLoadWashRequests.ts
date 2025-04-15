
import { useState, useEffect } from "react";
import { WashRequest, WashLocation, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLoadWashRequests(userId: string | undefined) {
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWashRequests = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        const { data: requestsData, error: requestsError } = await supabase
          .from('wash_requests')
          .select('*, wash_request_vehicles(vehicle_id)')
          .eq('user_id', userId);

        if (requestsError) {
          console.error("Error loading wash requests from Supabase:", requestsError);
          toast.error("Failed to load wash requests");
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        if (!requestsData || !Array.isArray(requestsData) || requestsData.length === 0) {
          setWashRequests([]);
          setIsLoading(false);
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
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        if (!locationsData || !Array.isArray(locationsData)) {
          console.error("Unexpected locations data format from Supabase");
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        // Map Supabase data to our WashRequest type
        const transformedWashRequests: WashRequest[] = requestsData.map(washRequest => {
          // Find the location for this request
          const locationData = locationsData.find(loc => loc.id === washRequest.location_id) || {
            id: washRequest.location_id,
            name: "Unknown Location",
            address: "",
            city: "",
            state: "",
            zip_code: ""
          };
          
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
        setWashRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWashRequests();
  }, [userId]);

  return { washRequests, setWashRequests, isLoading };
}
