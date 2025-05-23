
import { Vehicle } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadVehicleImageToStorage } from "./utils";
import { logVehicleOperation, logVehicleResponse, logVehicleOperationStep } from "./logging";

export async function updateVehicle(
  id: string, 
  data: Partial<Vehicle> & { locationId?: string }
): Promise<boolean> {
  logVehicleOperation('UPDATE_VEHICLE', data, id);
  
  try {
    // Extract locationId from the update data
    const { locationId, ...vehicleUpdateData } = data;
    logVehicleOperationStep('UPDATE_VEHICLE', 'Extracted locationId', { locationId, remainingData: vehicleUpdateData });

    // Handle image updates
    let imageUrl = data.image;
    
    if (data.image && data.image.startsWith('data:image')) {
      logVehicleOperationStep('UPDATE_VEHICLE', 'Processing image upload', { imageType: typeof data.image, imageLength: data.image.length });
      const { path, error: uploadError } = await uploadVehicleImageToStorage(data.image, supabase);
      if (uploadError) {
        logVehicleOperationStep('UPDATE_VEHICLE', 'Image upload error', uploadError);
        throw uploadError;
      }
      imageUrl = path;
      logVehicleOperationStep('UPDATE_VEHICLE', 'Image uploaded successfully', { path });
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

    logVehicleOperationStep('UPDATE_VEHICLE', 'Prepared update data', updateData);

    // Update the vehicle data
    logVehicleOperationStep('UPDATE_VEHICLE', 'Sending update request to Supabase', { id, updateData });
    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      logVehicleOperationStep('UPDATE_VEHICLE', 'Update error', updateError);
      throw updateError;
    }

    logVehicleOperationStep('UPDATE_VEHICLE', 'Vehicle updated successfully', updatedVehicle);

    // Handle location assignment if provided
    if (locationId) {
      logVehicleOperationStep('UPDATE_VEHICLE', 'Processing location update', { vehicleId: id, locationId });
      
      // CHANGE: Delete existing location associations for this vehicle
      logVehicleOperationStep('UPDATE_VEHICLE', 'Deleting existing location associations', { vehicleId: id });
      const { error: deleteError } = await supabase
        .from('location_vehicles')
        .delete()
        .eq('vehicle_id', id);

      if (deleteError) {
        logVehicleOperationStep('UPDATE_VEHICLE', 'Error deleting existing location associations', deleteError);
        console.error("Error deleting location associations:", deleteError);
        toast.error("Vehicle updated, but location update failed");
        logVehicleResponse('UPDATE_VEHICLE', null, deleteError);
        return false;
      }

      // CHANGE: Create new location association
      logVehicleOperationStep('UPDATE_VEHICLE', 'Creating new location association', { vehicleId: id, locationId });
      const { data: newLocation, error: insertError } = await supabase
        .from('location_vehicles')
        .insert({
          location_id: locationId,
          vehicle_id: id
        })
        .select('*')
        .maybeSingle();  // Use maybeSingle instead of single to handle cases where no rows are returned

      if (insertError) {
        logVehicleOperationStep('UPDATE_VEHICLE', 'Location association creation error', insertError);
        console.error("Error creating location association:", insertError);
        toast.error("Vehicle updated, but location assignment failed");
        logVehicleResponse('UPDATE_VEHICLE', null, insertError);
        return false;
      }
      
      logVehicleOperationStep('UPDATE_VEHICLE', 'Location association created successfully', newLocation);
      toast.success("Vehicle and location updated successfully!");
    } else {
      toast.success("Vehicle updated successfully!");
    }

    logVehicleResponse('UPDATE_VEHICLE', { success: true, vehicleId: id });
    return true;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    toast.error("Failed to update vehicle");
    logVehicleResponse('UPDATE_VEHICLE', null, error);
    return false;
  }
}
