
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

export async function addVehicle(
  user: { id: string; organizationId?: string } | null, 
  vehicleData: Omit<Vehicle, "id" | "dateAdded">
): Promise<Vehicle | null> {
  if (!user) {
    toast.error("You must be logged in to add a vehicle");
    return null;
  }

  try {
    const { customerId, make, model, year, licensePlate, color, type, vinNumber, image, organizationId } = vehicleData;
    
    // Convert base64 image to file and upload to storage if present
    let imageUrl = null;
    if (image && image.startsWith('data:image')) {
      const fileName = `${uuidv4()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('vehicle-images')
        .upload(`public/${fileName}`, base64ToBlob(image), {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        toast.error("Failed to upload vehicle image");
      } else if (uploadData) {
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(uploadData.path);
        imageUrl = data.publicUrl;
      }
    } else if (image) {
      // If image is already a URL, just use it
      imageUrl = image;
    }

    // Use the organization ID from the user if not explicitly provided
    const vehicleOrgId = organizationId || user.organizationId;

    // Insert new vehicle in Supabase
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        make,
        model,
        year,
        license_plate: licensePlate,
        color,
        type,
        vin_number: vinNumber,
        image_url: imageUrl,
        organization_id: vehicleOrgId
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error adding vehicle to Supabase:", error);
      toast.error("Failed to add vehicle");
      return null;
    }

    // Return the new vehicle
    const newVehicle: Vehicle = {
      id: data.id,
      customerId: data.user_id,
      make: data.make,
      model: data.model,
      year: data.year,
      licensePlate: data.license_plate || '',
      color: data.color || '',
      type: data.type || '',
      vinNumber: data.vin_number,
      image: data.image_url,
      dateAdded: new Date(data.created_at),
      organizationId: data.organization_id
    };
    
    toast.success("Vehicle added successfully!");
    return newVehicle;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    toast.error("Failed to add vehicle");
    return null;
  }
}

export async function updateVehicle(
  id: string, 
  data: Partial<Vehicle>
): Promise<boolean> {
  try {
    let imageUrl = data.image;

    // If image is new and in base64 format, upload it
    if (data.image && data.image.startsWith('data:image')) {
      const fileName = `${uuidv4()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('vehicle-images')
        .upload(`public/${fileName}`, base64ToBlob(data.image), {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        toast.error("Failed to upload vehicle image");
      } else if (uploadData) {
        const { data } = supabase.storage.from('vehicle-images').getPublicUrl(uploadData.path);
        imageUrl = data.publicUrl;
      }
    }

    // Map our data model to Supabase model
    const updateData: any = {
      make: data.make,
      model: data.model,
      year: data.year,
      license_plate: data.licensePlate,
      color: data.color,
      type: data.type,
      vin_number: data.vinNumber,
      organization_id: data.organizationId,
      updated_at: new Date()
    };
    
    // Handle image removal explicitly
    if (data.image === undefined) {
      updateData.image_url = null; // Set to null in database when image is removed
    } else if (imageUrl) {
      updateData.image_url = imageUrl; // Only update if we have a new image URL
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    console.log("Updating vehicle with data:", updateData);

    // Update in Supabase
    const { error } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating vehicle in Supabase:", error);
      toast.error("Failed to update vehicle");
      return false;
    }
    
    toast.success("Vehicle updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    toast.error("Failed to update vehicle");
    return false;
  }
}

export async function removeVehicle(id: string): Promise<boolean> {
  try {
    // Delete from Supabase
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
