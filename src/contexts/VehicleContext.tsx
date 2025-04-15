
import React, { createContext, useState, useContext, useEffect } from "react";
import { Vehicle } from "../models/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface VehicleContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  addVehicle: (vehicle: Omit<Vehicle, "id" | "dateAdded">) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  getVehicleById: (id: string) => Vehicle | undefined;
}

const VehicleContext = createContext<VehicleContextType>({} as VehicleContextType);

export function useVehicles() {
  return useContext(VehicleContext);
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles from Supabase when user changes
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          setVehicles([]);
          return;
        }

        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error loading vehicles from Supabase:", error);
          toast.error("Failed to load vehicles");
          return;
        }

        // Map Supabase data to our Vehicle type
        const transformedVehicles: Vehicle[] = data.map(vehicle => ({
          id: vehicle.id,
          customerId: vehicle.user_id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.license_plate || '',
          color: vehicle.color || '',
          type: vehicle.type || '',
          vinNumber: vehicle.vin_number,
          image: vehicle.image_url,
          dateAdded: new Date(vehicle.created_at)
        }));

        setVehicles(transformedVehicles);
      } catch (error) {
        console.error("Error in loadVehicles:", error);
        toast.error("Failed to load vehicles");
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, [user]);

  // Add a new vehicle
  const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "dateAdded">) => {
    if (!user) {
      toast.error("You must be logged in to add a vehicle");
      return;
    }

    try {
      const { customerId, make, model, year, licensePlate, color, type, vinNumber, image } = vehicleData;
      
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
          image_url: imageUrl
        })
        .select('*')
        .single();

      if (error) {
        console.error("Error adding vehicle to Supabase:", error);
        toast.error("Failed to add vehicle");
        return;
      }

      // Add to local state
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
        dateAdded: new Date(data.created_at)
      };
      
      setVehicles(prev => [...prev, newVehicle]);
      toast.success("Vehicle added successfully!");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
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
        image_url: imageUrl,
        updated_at: new Date()
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => 
        updateData[key] === undefined && delete updateData[key]
      );

      // Update in Supabase
      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error("Error updating vehicle in Supabase:", error);
        toast.error("Failed to update vehicle");
        return;
      }

      // Update local state
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === id 
          ? { ...vehicle, ...data, image: imageUrl || vehicle.image } 
          : vehicle
      ));
      
      toast.success("Vehicle updated successfully!");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };

  // Remove a vehicle
  const removeVehicle = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error removing vehicle from Supabase:", error);
        toast.error("Failed to remove vehicle");
        return;
      }

      // Update local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      toast.success("Vehicle removed successfully!");
    } catch (error) {
      console.error("Error removing vehicle:", error);
      toast.error("Failed to remove vehicle");
    }
  };

  // Get a vehicle by ID
  const getVehicleById = (id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

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

  const value = {
    vehicles,
    isLoading,
    addVehicle,
    updateVehicle,
    removeVehicle,
    getVehicleById,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
}
