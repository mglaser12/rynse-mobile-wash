
import { useState, useEffect } from "react";
import { WashLocation } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLoadLocations() {
  const [locations, setLocations] = useState<WashLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('wash_locations')
          .select('*');

        if (error) {
          console.error("Error loading locations from Supabase:", error);
          toast.error("Failed to load locations");
          return;
        }

        // Map Supabase data to our WashLocation type
        const transformedLocations: WashLocation[] = data.map(location => ({
          id: location.id,
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zip_code,
          coordinates: location.latitude && location.longitude ? {
            latitude: location.latitude,
            longitude: location.longitude
          } : undefined
        }));

        setLocations(transformedLocations);
      } catch (error) {
        console.error("Error in loadLocations:", error);
        toast.error("Failed to load locations");
      } finally {
        setIsLoading(false);
      }
    };

    loadLocations();
  }, []);

  return { locations, isLoading: isLoading };
}
