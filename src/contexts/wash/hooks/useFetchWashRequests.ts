
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { processWashRequests } from "../utils/processWashRequests";

/**
 * Hook for fetching wash requests based on user and role
 */
export function useFetchWashRequests() {
  /**
   * Fetch wash requests from Supabase based on user role and organization
   */
  const fetchWashRequests = useCallback(async (userId?: string, userRole?: string) => {
    if (!userId) {
      console.log("No user ID provided for fetching wash requests");
      return [];
    }
    
    try {
      console.log(`Fetching wash requests for user ${userId} with role ${userRole}`);
      
      // First, get the user's organization ID
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error("Error loading user profile:", userError);
        return [];
      }

      const organizationId = userData?.organization_id;
      console.log(`User organization ID: ${organizationId}`);
      
      let query = supabase
        .from('wash_requests')
        .select(`
          *,
          wash_request_vehicles!inner(
            vehicle_id,
            vehicles:vehicle_id(*)
          ),
          vehicle_wash_statuses(*),
          location:location_id(
            id, name, address, city, state, latitude, longitude
          )
        `);
      
      // Apply filters based on user role and organization
      if (userRole === 'technician') {
        if (organizationId) {
          // For technicians in an organization, show:
          // - All pending requests in their organization
          // - Requests assigned to them
          // - All confirmed requests in their organization
          query = query.or(`organization_id.eq.${organizationId},technician_id.eq.${userId}`);
        } else {
          // For technicians without an organization, show:
          // - Pending requests (available for claiming)
          // - Requests assigned to them
          query = query.or(`technician_id.is.null,technician_id.eq.${userId}`);
        }
      } else {
        if (organizationId) {
          // For customers/managers in an organization, show all requests in their organization
          query = query.eq('organization_id', organizationId);
        } else {
          // For customers without an organization, only show their requests
          query = query.eq('user_id', userId);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching wash requests:", error);
        return [];
      }
      
      // Process the data to convert it to our app's format
      return processWashRequests(data);
    } catch (error) {
      console.error("Error in fetchWashRequests:", error);
      return [];
    }
  }, []);
  
  return { fetchWashRequests };
}
