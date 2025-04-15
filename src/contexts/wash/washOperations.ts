
import { WashRequest, WashStatus } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateWashRequestData } from "./types";

export async function createWashRequest(
  userId: string | undefined, 
  requestData: CreateWashRequestData,
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>
): Promise<WashRequest | null> {
  try {
    if (!userId) {
      toast.error("You must be logged in to create a wash request");
      return null;
    }

    // Insert wash request in Supabase
    const { data, error } = await supabase
      .from('wash_requests')
      .insert({
        user_id: userId,
        location_id: requestData.location.id,
        preferred_date_start: requestData.preferredDates.start.toISOString(),
        preferred_date_end: requestData.preferredDates.end?.toISOString(),
        notes: requestData.notes,
        price: requestData.price,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating wash request in Supabase:", error);
      toast.error("Failed to create wash request");
      return null;
    }

    // Add vehicle associations
    for (const vehicleId of requestData.vehicles) {
      const { error: vehicleError } = await supabase
        .from('wash_request_vehicles')
        .insert({
          wash_request_id: data.id,
          vehicle_id: vehicleId
        });

      if (vehicleError) {
        console.error("Error linking vehicle to wash request:", vehicleError);
        // Continue with other vehicles even if one fails
      }
    }

    // Create WashRequest object from response
    const newRequest: WashRequest = {
      id: data.id,
      customerId: data.user_id,
      vehicles: requestData.vehicles,
      location: requestData.location,
      preferredDates: {
        start: new Date(data.preferred_date_start),
        end: data.preferred_date_end ? new Date(data.preferred_date_end) : undefined,
      },
      status: data.status as WashStatus,
      technician: data.technician_id || undefined,
      price: Number(data.price),
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };

    // Update local state
    setWashRequests(prev => [...prev, newRequest]);
    toast.success("Wash request created successfully!");
    return newRequest;
  } catch (error) {
    console.error("Error in createWashRequest:", error);
    toast.error("Failed to create wash request");
    return null;
  }
}

export async function updateWashRequest(
  id: string, 
  data: Partial<WashRequest>,
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>
): Promise<boolean> {
  try {
    // Map our data model to Supabase model
    const updateData: any = {};
    
    if (data.location) {
      updateData.location_id = data.location.id;
    }
    
    if (data.preferredDates?.start) {
      updateData.preferred_date_start = data.preferredDates.start.toISOString();
    }
    
    if (data.preferredDates?.end) {
      updateData.preferred_date_end = data.preferredDates.end.toISOString();
    }
    
    if (data.technician !== undefined) {
      updateData.technician_id = data.technician;
    }
    
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    
    updateData.updated_at = new Date().toISOString();

    // Update in Supabase
    const { error } = await supabase
      .from('wash_requests')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating wash request in Supabase:", error);
      toast.error("Failed to update wash request");
      return false;
    }

    // Update local state
    setWashRequests(prev => prev.map(washRequest =>
      washRequest.id === id
        ? { ...washRequest, ...data, updatedAt: new Date() }
        : washRequest
    ));

    toast.success("Wash request updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating wash request:", error);
    toast.error("Failed to update wash request");
    return false;
  }
}

export async function removeWashRequest(
  id: string,
  setWashRequests: React.Dispatch<React.SetStateAction<WashRequest[]>>
) {
  try {
    // Delete from Supabase
    const { error } = await supabase
      .from('wash_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing wash request from Supabase:", error);
      toast.error("Failed to remove wash request");
      return;
    }

    // Update local state
    setWashRequests(prev => prev.filter(washRequest => washRequest.id !== id));
    toast.success("Wash request removed successfully!");
  } catch (error) {
    console.error("Error removing wash request:", error);
    toast.error("Failed to remove wash request");
  }
}
