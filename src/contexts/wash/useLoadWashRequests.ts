
import { useState, useEffect, useCallback, useRef } from "react";
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLoadWashRequests(userId: string | undefined, userRole?: string) {
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const isLoadingRef = useRef(false);
  const errorCountRef = useRef(0);
  const MAX_RETRY_COUNT = 3;

  // Function to force refresh data
  const refreshData = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log("Already loading data, skipping refresh");
      return;
    }
    
    console.log("Manually refreshing wash request data");
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    const loadWashRequests = async () => {
      if (isLoadingRef.current) {
        console.log("Already loading wash requests, skipping duplicate load");
        return;
      }
      
      // Skip loading if we've had too many consecutive errors
      if (errorCountRef.current >= MAX_RETRY_COUNT) {
        console.log(`Skipping load after ${MAX_RETRY_COUNT} consecutive errors`);
        setIsLoading(false);
        isLoadingRef.current = false;
        return;
      }
      
      isLoadingRef.current = true;
      setIsLoading(true);
      
      try {
        if (!userId) {
          console.log("No user ID provided to useLoadWashRequests");
          setWashRequests([]);
          setIsLoading(false);
          isLoadingRef.current = false;
          return;
        }

        console.log("Attempting to load wash requests for user:", userId, "with role:", userRole);

        let requestsData: any[] = [];
        
        // For technicians, we show all pending requests and their own assigned requests
        // Now uses the organization-based visibility model
        if (userRole === 'technician') {
          console.log("Loading requests for technician - showing all pending and assigned requests within organization");
          
          // Use mock data if we're having connection issues (for demo purposes)
          const mockData = getMockWashRequests(userId);
          
          try {
            // Try to fetch from Supabase first - now using organization_wash_requests view
            const { data, error } = await supabase
              .from('organization_wash_requests')
              .select(`
                *,
                wash_request_vehicles!inner (
                  id,
                  vehicle_id,
                  vehicles (*)
                )
              `);
            
            if (error) {
              console.error("Error loading wash requests:", error);
              throw error;
            }
            
            requestsData = data || [];
            console.log("Successfully loaded data from Supabase:", requestsData);
            errorCountRef.current = 0; // Reset error count on success
          } catch (error) {
            errorCountRef.current++;
            console.error(`Error loading from Supabase (attempt ${errorCountRef.current}):`, error);
            
            if (errorCountRef.current >= MAX_RETRY_COUNT) {
              toast.error("Failed to connect to server. Using demo data instead.");
              requestsData = mockData;
            } else {
              toast.error("Connection issue. Please check your network.");
              throw error;
            }
          }
        } else if (userRole === 'admin') {
          // For admins, show all wash requests
          console.log("Loading all requests for admin");
          
          try {
            const { data, error } = await supabase
              .from('wash_requests')
              .select(`
                *,
                wash_request_vehicles!inner (
                  id,
                  vehicle_id,
                  vehicles (*)
                )
              `);
              
            if (error) {
              console.error("Error loading admin wash requests:", error);
              throw error;
            }
            
            requestsData = data || [];
            errorCountRef.current = 0; // Reset error count on success
          } catch (error) {
            errorCountRef.current++;
            console.error(`Error loading admin data (attempt ${errorCountRef.current}):`, error);
            
            if (errorCountRef.current >= MAX_RETRY_COUNT) {
              toast.error("Failed to load wash requests. Using demo data instead.");
              requestsData = getMockWashRequests(userId);
            } else {
              toast.error("Connection issue. Please check your network.");
              throw error;
            }
          }
        } else {
          // For customers/fleet managers, also load using organization-based visibility
          console.log("Loading requests for customer/fleet manager - showing all within organization");
          
          try {
            const { data, error } = await supabase
              .from('organization_wash_requests')
              .select(`
                *,
                wash_request_vehicles!inner (
                  id,
                  vehicle_id,
                  vehicles (*)
                )
              `);
              
            if (error) {
              console.error("Error loading customer wash requests:", error);
              throw error;
            }
            
            requestsData = data || [];
            errorCountRef.current = 0; // Reset error count on success
          } catch (error) {
            errorCountRef.current++;
            console.error(`Error loading customer data (attempt ${errorCountRef.current}):`, error);
            
            if (errorCountRef.current >= MAX_RETRY_COUNT) {
              toast.error("Failed to load your wash requests. Using demo data instead.");
              requestsData = getMockWashRequests(userId);
            } else {
              toast.error("Connection issue. Please check your network.");
              throw error;
            }
          }
        }

        console.log("Wash requests raw data:", requestsData);

        if (!requestsData || !Array.isArray(requestsData) || requestsData.length === 0) {
          console.log("No wash requests found for user", userId);
          setWashRequests([]);
          setIsLoading(false);
          isLoadingRef.current = false;
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
            updatedAt: new Date(washRequest.updated_at),
            organizationId: washRequest.organization_id
          };
        });

        console.log("Transformed wash requests:", transformedWashRequests);
        setWashRequests(transformedWashRequests);
      } catch (error) {
        console.error("Error in loadWashRequests:", error);
        if (errorCountRef.current >= MAX_RETRY_COUNT) {
          // If we've reached max retries, use mock data
          setWashRequests(getMockWashRequests(userId));
        }
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadWashRequests();
  }, [userId, userRole, lastRefreshed]);

  // Provide mock data when we have connection issues
  function getMockWashRequests(userId: string): any[] {
    console.log("Generating mock wash requests for user:", userId);
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    
    return [
      {
        id: "mock-1",
        user_id: "mock-customer-1",
        status: "pending",
        technician_id: null,
        price: 99.99,
        notes: "Mock request 1",
        preferred_date_start: now.toISOString(),
        preferred_date_end: tomorrow.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        organization_id: "mock-org-1",
        wash_request_vehicles: [
          {
            id: "mock-vehicle-1",
            vehicle_id: "mock-vehicle-id-1",
            vehicles: {
              id: "mock-vehicle-id-1",
              make: "Toyota",
              model: "Camry",
              year: "2020",
              color: "Blue",
              license_plate: "DEMO123"
            }
          }
        ]
      },
      {
        id: "mock-2",
        user_id: "mock-customer-2",
        status: "confirmed",
        technician_id: userId, // This one is assigned to the current user
        price: 79.99,
        notes: "Mock request 2",
        preferred_date_start: now.toISOString(),
        preferred_date_end: tomorrow.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        organization_id: "mock-org-1",
        wash_request_vehicles: [
          {
            id: "mock-vehicle-2",
            vehicle_id: "mock-vehicle-id-2",
            vehicles: {
              id: "mock-vehicle-id-2",
              make: "Honda",
              model: "Accord",
              year: "2021",
              color: "Red",
              license_plate: "DEMO456"
            }
          }
        ]
      }
    ];
  }

  return { washRequests, setWashRequests, isLoading, refreshData };
}
