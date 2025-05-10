
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseVehicleWashHistoryResult {
  isLoading: boolean;
  lastWashDate: Date | null;
  daysSinceLastWash: number | null;
}

export function useVehicleWashHistory(vehicleId: string): UseVehicleWashHistoryResult {
  const [isLoading, setIsLoading] = useState(true);
  const [lastWashDate, setLastWashDate] = useState<Date | null>(null);
  const [daysSinceLastWash, setDaysSinceLastWash] = useState<number | null>(null);

  useEffect(() => {
    const fetchWashHistory = async () => {
      setIsLoading(true);
      try {
        // Get all wash request IDs for this vehicle
        const { data: washRequestVehiclesData, error: washRequestVehiclesError } = await supabase
          .from('wash_request_vehicles')
          .select('wash_request_id')
          .eq('vehicle_id', vehicleId);

        if (washRequestVehiclesError) {
          throw washRequestVehiclesError;
        }

        if (!washRequestVehiclesData || washRequestVehiclesData.length === 0) {
          setLastWashDate(null);
          setDaysSinceLastWash(null);
          setIsLoading(false);
          return;
        }

        // Get all completed wash requests for this vehicle
        const washRequestIds = washRequestVehiclesData.map(item => item.wash_request_id);
        const { data: completedWashRequestsData, error: completedWashRequestsError } = await supabase
          .from('wash_requests')
          .select('updated_at')
          .in('id', washRequestIds)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (completedWashRequestsError) {
          throw completedWashRequestsError;
        }

        if (!completedWashRequestsData || completedWashRequestsData.length === 0) {
          setLastWashDate(null);
          setDaysSinceLastWash(null);
          setIsLoading(false);
          return;
        }

        // Calculate days since last wash
        const lastWash = new Date(completedWashRequestsData[0].updated_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastWash.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setLastWashDate(lastWash);
        setDaysSinceLastWash(diffDays);
      } catch (error) {
        console.error('Error fetching vehicle wash history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (vehicleId) {
      fetchWashHistory();
    }
  }, [vehicleId]);

  return { isLoading, lastWashDate, daysSinceLastWash };
}
