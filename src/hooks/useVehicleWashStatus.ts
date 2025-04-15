import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleWashStatus, SupabaseVehicleWashStatus } from "@/models/types";
import { toast } from "sonner";

// Convert Supabase vehicle wash status to our app's format
const mapSupabaseWashStatus = (status: SupabaseVehicleWashStatus): VehicleWashStatus => {
  return {
    id: status.id,
    vehicleId: status.vehicle_id,
    washRequestId: status.wash_request_id,
    technicianId: status.technician_id || undefined,
    completed: status.completed,
    notes: status.notes || undefined,
    postWashPhoto: status.post_wash_photo || undefined,
    createdAt: new Date(status.created_at),
    updatedAt: new Date(status.updated_at),
  };
};

export function useVehicleWashStatus() {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wash statuses for a specific wash request
  const fetchWashStatusesByWashId = async (washRequestId: string): Promise<VehicleWashStatus[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_wash_statuses')
        .select('*')
        .eq('wash_request_id', washRequestId);

      if (error) {
        throw error;
      }

      return (data as SupabaseVehicleWashStatus[]).map(mapSupabaseWashStatus);
    } catch (error) {
      console.error('Error fetching wash statuses:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create or update a vehicle wash status
  const saveVehicleWashStatus = async (status: VehicleWashStatus): Promise<VehicleWashStatus | null> => {
    setIsLoading(true);
    try {
      // Convert our app's wash status to Supabase format
      const supabaseStatus = {
        vehicle_id: status.vehicleId,
        wash_request_id: status.washRequestId,
        technician_id: status.technicianId,
        completed: status.completed,
        notes: status.notes || null,
        post_wash_photo: status.postWashPhoto || null,
      };

      let result;

      // If we have an ID, update the existing record
      if (status.id) {
        const { data, error } = await supabase
          .from('vehicle_wash_statuses')
          .update(supabaseStatus)
          .eq('id', status.id)
          .select()
          .single();

        if (error) throw error;
        result = data as SupabaseVehicleWashStatus;
      } else {
        // Otherwise, insert a new record
        const { data, error } = await supabase
          .from('vehicle_wash_statuses')
          .insert(supabaseStatus)
          .select()
          .single();

        if (error) throw error;
        result = data as SupabaseVehicleWashStatus;
      }

      return mapSupabaseWashStatus(result);
    } catch (error) {
      console.error('Error saving wash status:', error);
      toast.error('Failed to save wash status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Save multiple vehicle wash statuses
  const saveVehicleWashStatuses = async (
    statuses: VehicleWashStatus[]
  ): Promise<VehicleWashStatus[]> => {
    setIsLoading(true);
    try {
      const results: VehicleWashStatus[] = [];

      // Process each status one by one
      for (const status of statuses) {
        const savedStatus = await saveVehicleWashStatus(status);
        if (savedStatus) {
          results.push(savedStatus);
        }
      }

      return results;
    } catch (error) {
      console.error('Error saving wash statuses:', error);
      toast.error('Failed to save some wash statuses');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchWashStatusesByWashId,
    saveVehicleWashStatus,
    saveVehicleWashStatuses,
  };
}
