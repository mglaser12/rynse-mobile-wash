import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleWashStatus, SupabaseVehicleWashStatus } from "@/models/types";
import { toast } from "sonner";

const mapSupabaseWashStatus = (status: SupabaseVehicleWashStatus): VehicleWashStatus => ({
  id: status.id,
  vehicleId: status.vehicle_id,
  washRequestId: status.wash_request_id,
  technicianId: status.technician_id || undefined,
  completed: status.completed,
  notes: status.notes || undefined,
  postWashPhoto: status.post_wash_photo || undefined,
  createdAt: new Date(status.created_at),
  updatedAt: new Date(status.updated_at),
});

export function useVehicleWashStatus() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchWashStatusesByWashId = useCallback(async (washRequestId: string): Promise<VehicleWashStatus[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_wash_statuses')
        .select('*')
        .eq('wash_request_id', washRequestId);

      if (error) throw error;
      return (data as SupabaseVehicleWashStatus[]).map(mapSupabaseWashStatus);
    } catch (error) {
      console.error('Error fetching wash statuses:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveVehicleWashStatus = useCallback(async (status: VehicleWashStatus): Promise<VehicleWashStatus | null> => {
    setIsLoading(true);
    try {
      const supabaseStatus = {
        vehicle_id: status.vehicleId,
        wash_request_id: status.washRequestId,
        technician_id: status.technicianId,
        completed: status.completed,
        notes: status.notes || null,
        post_wash_photo: status.postWashPhoto || null,
      };

      if (status.id) {
        const { data, error } = await supabase
          .from('vehicle_wash_statuses')
          .update(supabaseStatus)
          .eq('id', status.id)
          .select()
          .single();

        if (error) throw error;
        return mapSupabaseWashStatus(data as SupabaseVehicleWashStatus);
      } else {
        const { data, error } = await supabase
          .from('vehicle_wash_statuses')
          .insert(supabaseStatus)
          .select()
          .single();

        if (error) throw error;
        return mapSupabaseWashStatus(data as SupabaseVehicleWashStatus);
      }
    } catch (error) {
      console.error('Error saving wash status:', error);
      toast.error('Failed to save wash status');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveVehicleWashStatuses = useCallback(async (
    statuses: VehicleWashStatus[]
  ): Promise<VehicleWashStatus[]> => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        statuses.map(status => saveVehicleWashStatus(status))
      );
      return results.filter((status): status is VehicleWashStatus => status !== null);
    } catch (error) {
      console.error('Error saving wash statuses:', error);
      toast.error('Failed to save some wash statuses');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [saveVehicleWashStatus]);

  return {
    isLoading,
    fetchWashStatusesByWashId,
    saveVehicleWashStatus,
    saveVehicleWashStatuses,
  };
}