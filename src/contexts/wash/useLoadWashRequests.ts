
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WashRequest, SupabaseWashRequest, SupabaseWashRequestVehicle, Vehicle, SupabaseVehicle } from "@/models/types";

export function useLoadWashRequests(userId?: string, userRole?: string) {
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Function to refresh data
  const refreshData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log(`Loading wash requests for user ${userId} with role ${userRole}`);
      
      // First, get the user's organization ID
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error("Error loading user profile:", userError);
        return;
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
        return;
      }
      
      // Process the data to convert it to our app's format
      const formattedRequests = processWashRequests(data);
      console.log("Processed wash requests:", formattedRequests);
      
      setWashRequests(formattedRequests);
    } catch (error) {
      console.error("Error in useLoadWashRequests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userRole]);
  
  // Load wash requests on component mount or when userId changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  return { washRequests, isLoading, refreshData };
}

// Helper function to process the wash requests data
function processWashRequests(data: any[]): WashRequest[] {
  if (!data) return [];
  
  const requestsMap = new Map<string, WashRequest>();
  
  for (const item of data) {
    const washRequest = item as SupabaseWashRequest;
    
    // If this is the first time we're seeing this request
    if (!requestsMap.has(washRequest.id)) {
      // Process location data safely
      let locationData = undefined;
      if (item.location && typeof item.location === 'object' && !('error' in item.location)) {
        const locationInfo = item.location as {
          id: string;
          name: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          latitude: number | null;
          longitude: number | null;
        };
        
        const locationName = locationInfo.name || "Unknown Location";
        let formattedAddress: string | undefined = undefined;
        
        if (locationInfo.address && locationInfo.city && locationInfo.state) {
          formattedAddress = `${locationInfo.address}, ${locationInfo.city}, ${locationInfo.state}`;
        }
        
        let coordinates: { lat: number; lng: number } | undefined = undefined;
        if (locationInfo.latitude && locationInfo.longitude) {
          coordinates = { lat: locationInfo.latitude, lng: locationInfo.longitude };
        }
        
        locationData = {
          name: locationName,
          address: formattedAddress,
          coordinates
        };
      }
      
      // Create a new wash request entry
      requestsMap.set(washRequest.id, {
        id: washRequest.id,
        customerId: washRequest.user_id,
        vehicles: [],
        vehicleDetails: [],
        preferredDates: {
          start: new Date(washRequest.preferred_date_start),
          end: washRequest.preferred_date_end 
            ? new Date(washRequest.preferred_date_end) 
            : undefined,
        },
        status: washRequest.status as any,
        technician: washRequest.technician_id || undefined,
        price: washRequest.price,
        notes: washRequest.notes || undefined,
        createdAt: new Date(washRequest.created_at),
        updatedAt: new Date(washRequest.updated_at),
        organizationId: washRequest.organization_id || undefined,
        locationId: washRequest.location_id || undefined,
        location: locationData,
        vehicleWashStatuses: item.vehicle_wash_statuses ? mapVehicleWashStatuses(item.vehicle_wash_statuses) : [],
      });
    }
    
    // Add vehicles associated with this wash request
    const currentRequest = requestsMap.get(washRequest.id);
    
    if (currentRequest && item.wash_request_vehicles) {
      for (const washVehicle of item.wash_request_vehicles) {
        const vehicleData = washVehicle.vehicles as SupabaseVehicle;
        
        if (vehicleData && !currentRequest.vehicles.includes(vehicleData.id)) {
          // Add vehicle ID to the list
          currentRequest.vehicles.push(vehicleData.id);
          
          // Add vehicle details
          const vehicle: Vehicle = {
            id: vehicleData.id,
            customerId: vehicleData.user_id,
            type: vehicleData.type || 'Unknown',
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            licensePlate: vehicleData.license_plate || 'Unknown',
            color: vehicleData.color || 'Unknown',
            image: vehicleData.image_url || undefined,
            vinNumber: vehicleData.vin_number || undefined,
            dateAdded: new Date(vehicleData.created_at),
            organizationId: vehicleData.organization_id || undefined,
          };
          
          currentRequest.vehicleDetails?.push(vehicle);
        }
      }
    }
  }
  
  return Array.from(requestsMap.values());
}

// Helper function to map vehicle wash statuses
function mapVehicleWashStatuses(statuses: any[]): any[] {
  if (!statuses || !Array.isArray(statuses)) return [];
  
  return statuses.map(status => ({
    id: status.id,
    vehicleId: status.vehicle_id,
    washRequestId: status.wash_request_id,
    technicianId: status.technician_id || undefined,
    completed: status.completed,
    notes: status.notes || undefined,
    postWashPhoto: status.post_wash_photo || undefined,
    createdAt: new Date(status.created_at),
    updatedAt: new Date(status.updated_at),
  }));
}
