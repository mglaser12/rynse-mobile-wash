
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface VehicleWashHistoryItem {
  id: string;
  washRequestId: string;
  date: Date;
  location?: string;
  notes?: string;
  photoUrl?: string;
}

export interface UseVehicleWashHistoryResult {
  isLoading: boolean;
  lastWashDate: Date | null;
  daysSinceLastWash: number | null;
  history: VehicleWashHistoryItem[];
}

export function useVehicleWashHistory(vehicleId: string): UseVehicleWashHistoryResult {
  const [isLoading, setIsLoading] = useState(true);
  const [lastWashDate, setLastWashDate] = useState<Date | null>(null);
  const [daysSinceLastWash, setDaysSinceLastWash] = useState<number | null>(null);
  const [history, setHistory] = useState<VehicleWashHistoryItem[]>([]);

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
          setHistory([]);
          setIsLoading(false);
          return;
        }

        // Get all completed wash requests for this vehicle
        const washRequestIds = washRequestVehiclesData.map(item => item.wash_request_id);
        const { data: completedWashRequestsData, error: completedWashRequestsError } = await supabase
          .from('wash_requests')
          .select(`
            id,
            preferred_date_start,
            updated_at,
            status,
            notes,
            locations:location_id (
              name, 
              address, 
              city, 
              state
            )
          `)
          .in('id', washRequestIds)
          .eq('status', 'completed')
          .order('updated_at', { ascending: false });

        if (completedWashRequestsError) {
          throw completedWashRequestsError;
        }

        if (!completedWashRequestsData || completedWashRequestsData.length === 0) {
          setLastWashDate(null);
          setDaysSinceLastWash(null);
          setHistory([]);
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

        // Format history items
        const historyItems: VehicleWashHistoryItem[] = completedWashRequestsData.map(req => {
          // Format location string if available
          let locationStr = undefined;
          if (req.locations) {
            const loc = req.locations as any;
            if (loc.name) {
              locationStr = loc.name;
              if (loc.city && loc.state) {
                locationStr += `, ${loc.city}, ${loc.state}`;
              }
            }
          }

          // Fetch vehicle wash status for photo
          // For now, we'll leave photoUrl undefined, but this could be enhanced later

          return {
            id: req.id,
            washRequestId: req.id,
            date: new Date(req.updated_at),
            location: locationStr,
            notes: req.notes || undefined,
            photoUrl: undefined
          };
        });

        setHistory(historyItems);
      } catch (error) {
        console.error('Error fetching vehicle wash history:', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (vehicleId) {
      fetchWashHistory();
    }
  }, [vehicleId]);

  return { isLoading, lastWashDate, daysSinceLastWash, history };
}
