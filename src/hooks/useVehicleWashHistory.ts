
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { WashRequest, VehicleWashStatus } from "@/models/types";
import { differenceInDays } from 'date-fns';

export interface VehicleWashHistoryItem {
  id: string;
  date: Date;
  status: string;
  notes?: string;
  photoUrl?: string;
  location?: string;
  washRequestId: string;
}

export const useVehicleWashHistory = (vehicleId: string | null) => {
  const [history, setHistory] = useState<VehicleWashHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastWashDate, setLastWashDate] = useState<Date | null>(null);
  const [daysSinceLastWash, setDaysSinceLastWash] = useState<number | null>(null);

  useEffect(() => {
    const fetchWashHistory = async () => {
      if (!vehicleId) {
        setHistory([]);
        setLastWashDate(null);
        setDaysSinceLastWash(null);
        return;
      }

      setIsLoading(true);
      try {
        // Get all wash requests for this vehicle
        const { data: washVehiclesData, error: washVehiclesError } = await supabase
          .from('wash_request_vehicles')
          .select('wash_request_id')
          .eq('vehicle_id', vehicleId);

        if (washVehiclesError) throw washVehiclesError;
        
        if (!washVehiclesData || washVehiclesData.length === 0) {
          setHistory([]);
          setIsLoading(false);
          return;
        }

        const washRequestIds = washVehiclesData.map(item => item.wash_request_id);

        // Get all wash requests with details
        const { data: washRequestsData, error: washRequestsError } = await supabase
          .from('wash_requests')
          .select(`
            *,
            location:location_id(name)
          `)
          .in('id', washRequestIds)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false });

        if (washRequestsError) throw washRequestsError;

        // Get wash statuses for this vehicle
        const { data: washStatusData, error: washStatusError } = await supabase
          .from('vehicle_wash_statuses')
          .select('*')
          .eq('vehicle_id', vehicleId);

        if (washStatusError) throw washStatusError;

        // Combine the data
        const historyItems = washRequestsData.map(request => {
          const status = washStatusData?.find(status => status.wash_request_id === request.id);
          
          return {
            id: request.id,
            date: new Date(request.updated_at),
            status: request.status,
            notes: status?.notes,
            photoUrl: status?.post_wash_photo,
            location: request.location?.name,
            washRequestId: request.id
          };
        });

        setHistory(historyItems);
        
        // Set last wash date if there are completed washes
        if (historyItems.length > 0) {
          const mostRecentWash = historyItems[0]; // Already sorted descending
          setLastWashDate(mostRecentWash.date);
          setDaysSinceLastWash(differenceInDays(new Date(), mostRecentWash.date));
        }
      } catch (error) {
        console.error("Error fetching vehicle wash history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWashHistory();
  }, [vehicleId]);

  return {
    history,
    isLoading,
    lastWashDate,
    daysSinceLastWash,
  };
};
