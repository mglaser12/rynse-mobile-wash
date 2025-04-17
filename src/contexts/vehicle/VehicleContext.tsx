import React, { createContext, useState, useContext, useEffect } from "react";
import { Vehicle } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { VehicleContextType } from "./types";
import { useLoadVehicles } from "./useLoadVehicles";
import { addVehicle as addVehicleOp, updateVehicle as updateVehicleOp, removeVehicle as removeVehicleOp } from "./operations";

const VehicleContext = createContext<VehicleContextType>({} as VehicleContextType);

export function useVehicles() {
  return useContext(VehicleContext);
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { vehicles: loadedVehicles, isLoading } = useLoadVehicles(user?.id);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    setVehicles(loadedVehicles);
  }, [loadedVehicles]);

  const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "dateAdded">, locationId?: string) => {
    const newVehicle = await addVehicleOp(user, { ...vehicleData, locationId });
    if (newVehicle) {
      setVehicles(prev => [...prev, newVehicle]);
    }
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle> & { locationId?: string }): Promise<boolean> => {
    console.log("Updating vehicle in context:", id, data);
    const success = await updateVehicleOp(id, data);
    if (success) {
      if (data.image === undefined) {
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === id ? { ...vehicle, ...data, image: undefined } : vehicle
        ));
      } else if (data.image && data.image.startsWith('data:image')) {
        const { image, locationId, ...otherData } = data;
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === id ? { ...vehicle, ...otherData } : vehicle
        ));
      } else {
        const { locationId, ...vehicleData } = data;
        setVehicles(prev => prev.map(vehicle => 
          vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
        ));
      }
    }
    return success;
  };

  const removeVehicle = async (id: string) => {
    const success = await removeVehicleOp(id);
    if (success) {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    }
  };

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
