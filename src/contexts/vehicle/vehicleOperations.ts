import { Vehicle } from "@/models/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert base64 to Blob
const base64ToBlob = (base64: string) => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

// Helper function to map data from the database to our Vehicle type
export const mapDbVehicleToVehicle = (dbVehicle: SupabaseVehicle): Vehicle => {
  return {
    id: dbVehicle.id,
    customerId: dbVehicle.user_id,
    make: dbVehicle.make,
    model: dbVehicle.model,
    year: dbVehicle.year,
    licensePlate: dbVehicle.license_plate || '',
    color: dbVehicle.color || '',
    type: dbVehicle.type || '',
    vinNumber: dbVehicle.vin_number,
    image: dbVehicle.image_url,
    dateAdded: new Date(dbVehicle.created_at),
    organizationId: dbVehicle.organization_id
  };
};

export async function addVehicle(
  user: { id: string; organizationId?: string } | null, 
  vehicleData: Omit<Vehicle, "id" | "dateAdded"> & { locationId?: string }
): Promise<Vehicle | null> {
  if (!user) {
    toast.error("You need to be logged in to add a vehicle");
    return null;
  }

  try {
    // Extract locationId from the vehicleData
    const { locationId, ...vehicleInsertData } = vehicleData;

    // Convert image to a file for storage if it's a base64 string
    let imageUrl = vehicleData.image;
    if (vehicleData.image && vehicleData.image.startsWith('data:image')) {
      const { path, error: uploadError } = await uploadVehicleImageToStorage(vehicleData.image);
      if (uploadError) throw uploadError;
      imageUrl = path;
    }

    // Prepare data for insertion
    const insertData = {
      user_id: user.id,
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year,
      license_plate: vehicleData.licensePlate || null,
      color: vehicleData.color || null,
      type: vehicleData.type || null,
      vin_number: vehicleData.vinNumber || null,
      image_url: imageUrl || null,
      organization_id: vehicleData.organizationId || null
    };

    // Insert the vehicle
    const { data: vehicleData1, error: insertError } = await supabase
      .from('vehicles')
      .insert(insertData)
      .select('*')
      .single();

    if (insertError) throw insertError;

    // If locationId is provided, create a location-vehicle association
    if (locationId) {
      const { error: locationVehicleError } = await supabase
        .from('location_vehicles')
        .insert({
          location_id: locationId,
          vehicle_id: vehicleData1.id
        });

      if (locationVehicleError) {
        console.error("Error creating location association:", locationVehicleError);
        toast.error("Vehicle saved, but location assignment failed.");
      }
    }

    // Return the vehicle data mapped to our Vehicle type
    return {
      id: vehicleData1.id,
      customerId: vehicleData1.user_id,
      type: vehicleData1.type || '',
      make: vehicleData1.make,
      model: vehicleData1.model,
      year: vehicleData1.year,
      licensePlate: vehicleData1.license_plate || '',
      color: vehicleData1.color || '',
      image: vehicleData1.image_url || undefined,
      vinNumber: vehicleData1.vin_number || undefined,
      dateAdded: new Date(vehicleData1.created_at),
      organizationId: vehicleData1.organization_id || undefined,
    };
  } catch (error) {
    console.error("Error adding vehicle:", error);
    toast.error("Failed to add vehicle");
    return null;
  }
};

// Upload a vehicle image to storage
const uploadVehicleImageToStorage = async (base64Image: string): Promise<{ path: string | null; error: Error | null }> => {
  const fileName = `${uuidv4()}.jpg`;
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('vehicle-images')
    .upload(`public/${fileName}`, base64ToBlob(base64Image), {
      contentType: 'image/jpeg',
      cacheControl: '3600'
    });

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    toast.error("Failed to upload vehicle image");
    return { path: null, error: uploadError };
  } else if (uploadData) {
    const { data } = supabase.storage.from('vehicle-images').getPublicUrl(uploadData.path);
    return { path: data.publicUrl, error: null };
  }

  return { path: null, error: null };
};

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
      const { path, error: uploadError } = await uploadVehicleImageToStorage(data.image);
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
        .select('location_id')
        .eq('vehicle_id', id);

      if (fetchError) throw fetchError;

      if (existingLocations && existingLocations.length > 0) {
        // Update existing location
        const { error: updateLocError } = await supabase
          .from('location_vehicles')
          .update({ location_id: locationId })
          .eq('vehicle_id', id);

        if (updateLocError) throw updateLocError;
      } else {
        // Create new location association
        const { error: insertLocError } = await supabase
          .from('location_vehicles')
          .insert({
            location_id: locationId,
            vehicle_id: id
          });

        if (insertLocError) throw insertLocError;
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    toast.error("Failed to update vehicle");
    return false;
  }
};

export async function removeVehicle(id: string): Promise<boolean> {
  try {
    // Delete from Supabase - no need to check user_id or organization_id
    // since we're allowing all users in the same org to delete any vehicle in their org
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error removing vehicle from Supabase:", error);
      toast.error("Failed to remove vehicle");
      return false;
    }

    toast.success("Vehicle removed successfully!");
    return true;
  } catch (error) {
    console.error("Error removing vehicle:", error);
    toast.error("Failed to remove vehicle");
    return false;
  }
}
