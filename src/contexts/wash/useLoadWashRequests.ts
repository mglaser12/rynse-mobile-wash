
import { useState, useEffect } from "react";
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLoadWashRequests(userId: string | undefined, userRole?: string) {
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to force refresh data
  const refreshData = () => {
    console.log("Manually refreshing wash request data");
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    const loadWashRequests = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          console.log("No user ID provided to useLoadWashRequests");
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        console.log("Attempting to load wash requests for user:", userId, "with role:", userRole);

        let requestsData: any[] = [];
        
        // For technicians, we show all pending requests and their own assigned requests
        if (userRole === 'technician') {
          console.log("Loading requests for technician - showing all pending and assigned requests");
          
          // Fetch wash requests with their associated vehicle data
          const { data, error } = await supabase
            .from('wash_requests')
            .select(`
              *,
              wash_request_vehicles!inner (
                id,
                vehicle_id,
                vehicles (*)
              )
            `)
            .or(`technician_id.eq.${userId},status.eq.pending`);
          
          if (error) {
            console.error("Error loading wash requests:", error);
            toast.error("Failed to load wash requests");
            setWashRequests([]);
            setIsLoading(false);
            return;
          }
          
          requestsData = data || [];
        } else {
          // For customers/fleet managers, only show their own requests
          console.log("Loading requests for customer - showing only their own requests");
          
          const { data, error } = await supabase
            .from('wash_requests')
            .select(`
              *,
              wash_request_vehicles!inner (
                id,
                vehicle_id,
                vehicles (*)
              )
            `)
            .eq('user_id', userId);
            
          if (error) {
            console.error("Error loading customer wash requests:", error);
            toast.error("Failed to load wash requests");
            setWashRequests([]);
            setIsLoading(false);
            return;
          }
          
          requestsData = data || [];
        }

        console.log("Wash requests raw data:", requestsData);

        if (!requestsData || !Array.isArray(requestsData) || requestsData.length === 0) {
          console.log("No wash requests found for user", userId);
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        // Map Supabase data to our WashRequest type
        const transformedWashRequests: WashRequest[] = requestsData.map(washRequest => {
          // Extract vehicles data
          const vehicleIds = washRequest.wash_request_vehicles 
            ? washRequest.wash_request_vehicles.map((item: any) => item.vehicle_id)
            : [];

          // Also extract full vehicle objects for reference
          const vehicles = washRequest.wash_request_vehicles 
            ? washRequest.wash_request_vehicles.map((item: any) => item.vehicles) 
            : [];

          console.log("Vehicle data for request:", washRequest.id, vehicles);

          return {
            id: washRequest.id,
            customerId: washRequest.user_id,
            vehicles: vehicleIds,
            vehicleDetails: vehicles, // Add full vehicle details
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

        console.log("Transformed wash requests:", transformedWashRequests);
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
  }, [userId, userRole, lastRefreshed]);

  return { washRequests, setWashRequests, isLoading, refreshData };
}
