
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { logVehicleOperation } from './logging';
import { SupabaseVehicle } from '@/models/types';

export type AddVehicleParams = {
  make: string;
  model: string;
  year: string;
  type: string;
  color: string;
  license_plate: string;
  vin_number?: string;
  asset_number?: string;
  image_url?: string;
  organization_id?: string;
};

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  type: string;
  color: string;
  licensePlate: string;
  vinNumber: string;
  assetNumber: string;
  imageUrl: string;
  userId: string;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AddVehicleResponse {
  success: boolean;
  vehicle?: Vehicle;
  error?: string;
}

// Helper function to map our Vehicle type to Supabase format
function mapVehicleToSupabaseVehicle(vehicle: Vehicle): SupabaseVehicle {
  return {
    id: vehicle.id,
    user_id: vehicle.userId,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    type: vehicle.type,
    color: vehicle.color,
    license_plate: vehicle.licensePlate,
    vin_number: vehicle.vinNumber,
    asset_number: vehicle.assetNumber,
    image_url: vehicle.imageUrl,
    organization_id: vehicle.organizationId,
    created_at: vehicle.createdAt,
    updated_at: vehicle.updatedAt
  };
}

// Helper function to map Supabase data to our Vehicle type
function mapVehicleFromSupabaseVehicle(data: SupabaseVehicle): Vehicle {
  return {
    id: data.id,
    make: data.make,
    model: data.model,
    year: data.year,
    type: data.type || '',
    color: data.color || '',
    licensePlate: data.license_plate || '',
    vinNumber: data.vin_number || '',
    assetNumber: data.asset_number || '',
    imageUrl: data.image_url || '',
    userId: data.user_id,
    organizationId: data.organization_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at
  };
}

export async function addVehicle(
  params: AddVehicleParams,
  user_id: string
): Promise<AddVehicleResponse> {
  try {
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const vehicle: Vehicle = {
      id,
      make: params.make,
      model: params.model,
      year: params.year,
      type: params.type,
      color: params.color,
      licensePlate: params.license_plate,
      vinNumber: params.vin_number || '',
      assetNumber: params.asset_number || '',
      imageUrl: params.image_url || '',
      userId: user_id,
      organizationId: params.organization_id || null,
      createdAt: created_at,
      updatedAt: updated_at,
    };

    // Convert to Supabase format
    const supabaseVehicle = mapVehicleToSupabaseVehicle(vehicle);

    // Insert vehicle to database
    const { data, error } = await supabase
      .from('vehicles')
      .insert([supabaseVehicle])
      .select()
      .single();

    if (error) {
      console.error('Error adding vehicle:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Failed to add vehicle: No data returned',
      };
    }

    logVehicleOperation('add', {
      id: data.id,
      make: data.make,
      model: data.model,
      licensePlate: data.license_plate,
    });

    return {
      success: true,
      vehicle: mapVehicleFromSupabaseVehicle(data as SupabaseVehicle),
    };
  } catch (error) {
    console.error('Unexpected error adding vehicle:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while adding the vehicle',
    };
  }
}
