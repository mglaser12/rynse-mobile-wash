
import { Vehicle } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadVehicleImageToStorage } from "./utils";

export async function updateVehicle(
  id: string, 
  data: Partial<Vehicle> & { locationId?: string }
): Promise<boolean> {
  try {
    // Extract locationId from the update data
    const { locationId, ...vehicleUpdateData } = data;

    // Handle image updates
    let imageUrl = data.image;
    
    if (data.image && data.image.startsWith('data:image')) {
      const { path, error: uploadError } = await uploadVehicleImageToStorage(data.image, supabase);
      if (uploadError) throw uploadError;
      imageUrl = path;
    }

    // Prepare data for update
    const updateData: any = {};
    if (vehicleUpdateData.make !== undefined) updateData.make = vehicleUpdateData.make;
    if (vehicleUpdateData.model !== undefined) updateData.model = vehicleUpdateData.model;
    if (vehicleUpdateData.year !== undefined) updateData.year = vehicleUpdateData.year;
    if (vehicleUpdateData.licensePlate !== undefined) updateData.license_plate = vehicleUpdateData.licensePlate || null;
    if (vehicleUpdateData.color !== undefined) updateData.color = vehicleUpdateData.color || null;
    if (vehicleUpdateData.type !== undefined) updateData.type = vehicleUpdateData.type || null;
    if (vehicleUpdateData.vinNumber !== undefined) updateData.vin_number = vehicleUpdateData.vinNumber || null;
    if (vehicleUpdateData.organizationId !== undefined) updateData.organization_id = vehicleUpdateData.organizationId;
    
    // Handle image explicitly
    if (imageUrl !== undefined) {
      if (imageUrl === null) {
        updateData.image_url = null;
      } else if (!imageUrl.startsWith('data:image')) {
        updateData.image_url = imageUrl;
      }
    }

    // Update the vehicle data
    const { error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    // Handle location assignment if provided
    if (locationId) {
      // First check if vehicle already has a location
      const { data: existingLocations, error: fetchError } = await supabase
        .from('location_vehicles')
        .select('location_id, id')
        .eq('vehicle_id', id);

      if (fetchError) throw fetchError;

      if (existingLocations && existingLocations.length > 0) {
        // Update existing location
        const { error: updateLocError } = await supabase
          .from('location_vehicles')
          .update({ location_id: locationId })
          .eq('vehicle_id', id);

        if (updateLocError) {
          console.error("Error updating location association:", updateLocError);
          toast.error("Vehicle updated, but location update failed");
          return false;
        }
      } else {
        // Create new location association
        const { error: insertLocError } = await supabase
          .from('location_vehicles')
          .insert({
            location_id: locationId,
            vehicle_id: id
          });

        if (insertLocError) {
          console.error("Error creating location association:", insertLocError);
          toast.error("Vehicle updated, but location assignment failed");
          return false;
        }
      }
      
      toast.success("Vehicle and location updated successfully!");
    } else {
      toast.success("Vehicle updated successfully!");
    }

    return true;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    toast.error("Failed to update vehicle");
    return false;
  }
}
