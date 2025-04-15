
import React, { createContext, useState, useContext, useEffect } from "react";
import { Vehicle } from "@/models/types";
import { useAuth } from "../AuthContext";
import { VehicleContextType } from "./types";
import { useLoadVehicles } from "./useLoadVehicles";
import { addVehicle as addVehicleOp, updateVehicle as updateVehicleOp, removeVehicle as removeVehicleOp } from "./vehicleOperations";

const VehicleContext = createContext<VehicleContextType>({} as VehicleContextType);

export function useVehicles() {
  return useContext(VehicleContext);
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { vehicles: loadedVehicles, isLoading } = useLoadVehicles(user?.id);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Update local state when loaded vehicles change
  useEffect(() => {
    setVehicles(loadedVehicles);
  }, [loadedVehicles]);

  // Add a new vehicle
  const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "dateAdded">) => {
    const newVehicle = await addVehicleOp(user, vehicleData);
    if (newVehicle) {
      setVehicles(prev => [...prev, newVehicle]);
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    const success = await updateVehicleOp(id, data);
    if (success) {
      // If image was removed or changed, update the local state
      if (data.image === undefined) {
        // Image was removed
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === id ? { ...vehicle, ...data, image: undefined } : vehicle
        ));
      } else if (data.image && data.image.startsWith('data:image')) {
        // If the image is a base64 string, this means it was changed
        // We'll update it with the URL that comes back from Supabase in the next fetch
        // For now, just update the other fields
        const { image, ...otherData } = data;
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === id ? { ...vehicle, ...otherData } : vehicle
        ));
      } else {
        // Normal update
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === id ? { ...vehicle, ...data } : vehicle
        ));
      }
    }
  };

  // Remove a vehicle
  const removeVehicle = async (id: string) => {
    const success = await removeVehicleOp(id);
    if (success) {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    }
  };

  // Get a vehicle by ID
  const getVehicleById = (id: string) => {
    return vehicles.find(vehicle => vehicle.id === id);
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

export type { VehicleContextType };
export * from "./types";
