
import { v4 as uuidv4 } from 'uuid';
import type { SupabaseVehicle, Vehicle } from '../types';
import { mapVehicleToSupabaseVehicle, mapVehicleFromSupabaseVehicle } from './mappers';
import { supabase } from '@/integrations/supabase/client';
import { logVehicleOperation } from './logging';

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

export interface AddVehicleResponse {
  success: boolean;
  vehicle?: Vehicle;
  error?: string;
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
