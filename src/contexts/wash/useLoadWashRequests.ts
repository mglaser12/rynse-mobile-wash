
import { useState, useEffect } from "react";
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLoadWashRequests(userId: string | undefined, userRole?: string) {
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

        console.log("Attempting to load wash requests for user:", userId, "with role:", userRole);

        // First, check if the user exists in the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error verifying user profile:", profileError);
        } else {
          console.log("User profile found:", profileData);
        }

        // Determine role from either parameter or profile data
        const effectiveRole = userRole || profileData?.role;
        console.log("Effective role for query:", effectiveRole);
        
        // First check for total requests in the system for debugging
        const { data: allRequests, error: allRequestsError } = await supabase
          .from('wash_requests')
          .select('id, status, technician_id, user_id');
          
        console.log("Total requests in system:", allRequests);
        if (allRequestsError) {
          console.error("Error fetching all requests:", allRequestsError);
        }
        
        // Specific check for pending requests
        const { data: pendingRequests, error: pendingError } = await supabase
          .from('wash_requests')
          .select('id, status, technician_id, user_id')
          .eq('status', 'pending');
          
        console.log("All pending requests:", pendingRequests);
        if (pendingError) {
          console.error("Error fetching pending requests:", pendingError);
        }
        
        let query;
        
        // For technicians, we show all pending requests and their own assigned requests
        if (effectiveRole === 'technician') {
          console.log("Loading requests for technician - showing all pending and assigned requests");
          
          // Use two separate queries and combine the results for more reliable behavior
          const pendingQuery = supabase
            .from('wash_requests')
            .select('*, wash_request_vehicles(vehicle_id)')
            .eq('status', 'pending');
            
          const assignedQuery = supabase
            .from('wash_requests')
            .select('*, wash_request_vehicles(vehicle_id)')
            .eq('technician_id', userId);
            
          // Execute both queries
          const [pendingResult, assignedResult] = await Promise.all([
            pendingQuery,
            assignedQuery
          ]);
          
          // Handle errors
          if (pendingResult.error) {
            console.error("Error fetching pending requests:", pendingResult.error);
          }
          
          if (assignedResult.error) {
            console.error("Error fetching assigned requests:", assignedResult.error);
          }
          
          // Combine results
          const combinedData = [
            ...(pendingResult.data || []), 
            ...(assignedResult.data || [])
          ];
          
          // Remove duplicates (in case a pending request is also assigned to this tech)
          const uniqueData = combinedData.filter((v, i, a) => 
            a.findIndex(t => t.id === v.id) === i
          );
          
          console.log("Combined wash request data:", uniqueData);
          
          // Proceed with the combined data
          var requestsData = uniqueData;
        } else {
          // For customers/fleet managers, only show their own requests
          console.log("Loading requests for customer - showing only their own requests");
          
          const { data, error } = await supabase
            .from('wash_requests')
            .select('*, wash_request_vehicles(vehicle_id)')
            .eq('user_id', userId);
            
          if (error) {
            console.error("Error loading customer wash requests:", error);
            toast.error("Failed to load wash requests");
            setWashRequests([]);
            setIsLoading(false);
            return;
          }
          
          var requestsData = data;
        }

        console.log("Wash requests raw data:", requestsData);

        // Check if there are actual wash requests in the database (regardless of user)
        const { data: countData, error: countError } = await supabase
          .from('wash_requests')
          .select('id, status, technician_id, user_id');
          
        const totalRequestsCount = countData ? countData.length : 0;
        console.log("Total wash requests in database:", totalRequestsCount);
        console.log("Details of all requests:", countData);
        
        if (countError) {
          console.error("Error counting requests:", countError);
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
  }, [userId, userRole]);

  return { washRequests, setWashRequests, isLoading };
}
