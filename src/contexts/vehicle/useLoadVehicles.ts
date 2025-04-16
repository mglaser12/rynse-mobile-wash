
import { useState, useEffect } from "react";
import { Vehicle } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UseLoadVehiclesResult } from "./types";

export function useLoadVehicles(userId: string | undefined): UseLoadVehiclesResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles from Supabase when user changes
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      try {
        if (!userId) {
          setVehicles([]);
          return;
        }

        // First, get the user's organization ID
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (userError) {
          console.error("Error loading user profile:", userError);
          toast.error("Failed to load user profile");
          return;
        }

        const organizationId = userData?.organization_id;
        
        if (!organizationId) {
          // If user doesn't have an organization, just load their personal vehicles
          const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('user_id', userId);
            
          if (error) {
            console.error("Error loading personal vehicles:", error);
            toast.error("Failed to load vehicles");
            return;
          }
          
          // Map Supabase data to our Vehicle type
          const transformedVehicles: Vehicle[] = data.map(vehicle => ({
            id: vehicle.id,
            customerId: vehicle.user_id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            licensePlate: vehicle.license_plate || '',
            color: vehicle.color || '',
            type: vehicle.type || '',
            vinNumber: vehicle.vin_number,
            image: vehicle.image_url,
            dateAdded: new Date(vehicle.created_at),
            organizationId: vehicle.organization_id
          }));
          
          setVehicles(transformedVehicles);
          return;
        }

        // Load all vehicles from the user's organization
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('organization_id', organizationId);

        if (error) {
          console.error("Error loading organization vehicles:", error);
          toast.error("Failed to load vehicles");
          return;
        }

        // Map Supabase data to our Vehicle type
        const transformedVehicles: Vehicle[] = data.map(vehicle => ({
          id: vehicle.id,
          customerId: vehicle.user_id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.license_plate || '',
          color: vehicle.color || '',
          type: vehicle.type || '',
          vinNumber: vehicle.vin_number,
          image: vehicle.image_url,
          dateAdded: new Date(vehicle.created_at),
          organizationId: vehicle.organization_id
        }));

        console.log(`Loaded ${transformedVehicles.length} vehicles for organization ${organizationId}`);
        setVehicles(transformedVehicles);
      } catch (error) {
        console.error("Error in loadVehicles:", error);
        toast.error("Failed to load vehicles");
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, [userId]);

  return { vehicles, isLoading };
}
