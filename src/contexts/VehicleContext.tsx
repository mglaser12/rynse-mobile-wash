import React, { createContext, useState, useContext, useEffect } from "react";
import { Vehicle } from "../models/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { SAMPLE_VEHICLES } from "../utils/sampleData";

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

  // Load vehicles on mount or when user changes
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      try {
        // Normally we would fetch from an API
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        
        const savedVehicles = localStorage.getItem("vehicles");
        if (savedVehicles) {
          try {
            const parsedVehicles = JSON.parse(savedVehicles);
            setVehicles(parsedVehicles);
          } catch (error) {
            console.error("Error parsing saved vehicles:", error);
            // Fall back to sample data
            setVehicles(user ? SAMPLE_VEHICLES.filter(v => v.customerId === user.id) : []);
          }
        } else {
          // Use sample data first time
          setVehicles(user ? SAMPLE_VEHICLES.filter(v => v.customerId === user.id) : []);
          localStorage.setItem("vehicles", JSON.stringify(SAMPLE_VEHICLES));
        }
      } catch (error) {
        console.error("Error loading vehicles:", error);
        toast.error("Failed to load vehicles");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadVehicles();
    } else {
      setVehicles([]);
      setIsLoading(false);
    }
  }, [user]);

  // Add a new vehicle
  const addVehicle = async (vehicleData: Omit<Vehicle, "id" | "dateAdded">) => {
    if (!user) {
      toast.error("You must be logged in to add a vehicle");
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: Math.random().toString(36).substring(2, 11),
        dateAdded: new Date(),
      };
      
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
      toast.success("Vehicle added successfully!");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error("Failed to add vehicle");
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...data, updatedAt: new Date() } : vehicle
      );
      
      setVehicles(updatedVehicles);
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
      toast.success("Vehicle updated successfully!");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error("Failed to update vehicle");
    }
  };

  // Remove a vehicle
  const removeVehicle = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
      setVehicles(updatedVehicles);
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
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
