
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

        // Check Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase.from('profiles').select('count').limit(1);
        if (connectionError) {
          console.error("Supabase connection test failed:", connectionError);
          toast.error("Database connection failed. Please try again later.");
          setWashRequests([]);
          setIsLoading(false);
          return;
        }
        console.log("Supabase connection test successful");

        // First, check if the user exists in the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error verifying user profile:", profileError);
          toast.error("Failed to verify user profile");
          setWashRequests([]);
          setIsLoading(false);
          return;
        } else {
          console.log("User profile found:", profileData);
        }

        // Determine role from either parameter or profile data
        const effectiveRole = userRole || profileData?.role;
        console.log("Effective role for query:", effectiveRole);
        
        // First check for total requests in the system for debugging
        console.log("Checking all wash requests in the system without filters");
        const { data: directAllRequests, error: directAllError } = await supabase
          .from('wash_requests')
          .select('id, status, technician_id, user_id, preferred_date_start');
          
        console.log("Direct database check - All wash requests:", directAllRequests);
        if (directAllError) {
          console.error("Error in direct database check:", directAllError);
        }
        
        let requestsData: any[] = [];
        
        // For technicians, we show all pending requests and their own assigned requests
        if (effectiveRole === 'technician') {
          console.log("Loading requests for technician - showing all pending and assigned requests");
          
          // Attempt direct access to pending requests without RLS
          console.log("Attempting direct access to pending requests");
          const directPendingCheck = await supabase
            .from('wash_requests')
            .select('id')
            .eq('status', 'pending');
            
          console.log("Direct pending check:", directPendingCheck.data, directPendingCheck.error);
          
          // Use separate queries for pending and assigned requests
          console.log("Attempting to fetch ALL pending requests regardless of technician");
          const pendingQuery = await supabase
            .from('wash_requests')
            .select('*, wash_request_vehicles(vehicle_id)')
            .eq('status', 'pending');
            
          console.log("Pending query result:", pendingQuery.data?.length || 0, "records");
          console.log("Pending query error:", pendingQuery.error);
          
          if (pendingQuery.error) {
            console.error("Failed to fetch pending requests:", pendingQuery.error);
          }
          
          console.log("Attempting to fetch requests assigned to this technician");
          const assignedQuery = await supabase
            .from('wash_requests')
            .select('*, wash_request_vehicles(vehicle_id)')
            .eq('technician_id', userId);
            
          console.log("Assigned query result:", assignedQuery.data?.length || 0, "records");
          console.log("Assigned query error:", assignedQuery.error);
          
          // Combine results from both queries
          const pendingData = pendingQuery.data || [];
          const assignedData = assignedQuery.data || [];
          
          console.log("Raw pending data:", pendingData);
          console.log("Raw assigned data:", assignedData);
          
          // Combine and deduplicate
          const combinedData = [...pendingData, ...assignedData];
          
          // Remove duplicates based on id
          const uniqueData = Array.from(
            new Map(combinedData.map(item => [item.id, item])).values()
          );
          
          console.log("Combined and deduplicated data:", uniqueData);
          requestsData = uniqueData;
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
  }, [userId, userRole, lastRefreshed]);

  return { washRequests, setWashRequests, isLoading, refreshData };
}
