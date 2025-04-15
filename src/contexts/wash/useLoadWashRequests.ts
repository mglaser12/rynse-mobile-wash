
import { useState, useEffect } from "react";
import { WashRequest, WashStatus } from "@/models/types";
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
          console.log("No user ID provided to useLoadWashRequests");
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        console.log("Attempting to load wash requests for user:", userId);

        // First, check if the user exists in the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error verifying user profile:", profileError);
        } else {
          console.log("User profile found:", profileData);
        }

        // Check for wash requests
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

        console.log("Wash requests raw data:", requestsData);

        // Check if there are actual wash requests in the database (regardless of user)
        // Using a simple select * and count the results instead of using count(*)
        const { data: countData, error: countError } = await supabase
          .from('wash_requests')
          .select('id');
          
        const totalRequestsCount = countData ? countData.length : 0;
        console.log("Total wash requests in database:", totalRequestsCount);
        
        if (countError) {
          console.error("Error counting requests:", countError);
        }

        // Check RLS permissions with a simple query
        try {
          const { data: rlsTestData, error: rlsError } = await supabase
            .from('wash_requests')
            .select('id')
            .limit(1);
          
          console.log("RLS test result:", { data: rlsTestData, error: rlsError });
        } catch (rlsError) {
          console.error("RLS test failed:", rlsError);
        }

        if (!requestsData || !Array.isArray(requestsData) || requestsData.length === 0) {
          console.log("No wash requests found for user", userId);
          setWashRequests([]);
          setIsLoading(false);
          return;
        }

        // Map Supabase data to our WashRequest type
        const transformedWashRequests: WashRequest[] = requestsData.map(washRequest => {
          // Get vehicle IDs for this request
          const vehicleIds = washRequest.wash_request_vehicles 
            ? washRequest.wash_request_vehicles.map((item: any) => item.vehicle_id)
            : [];

          return {
            id: washRequest.id,
            customerId: washRequest.user_id,
            vehicles: vehicleIds,
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
  }, [userId]);

  return { washRequests, setWashRequests, isLoading };
}
