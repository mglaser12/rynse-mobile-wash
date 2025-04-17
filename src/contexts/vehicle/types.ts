
import { Vehicle } from "@/models/types";

export interface VehicleContextType {
  vehicles: Vehicle[];
  isLoading: boolean;
  addVehicle: (vehicle: Omit<Vehicle, "id" | "dateAdded">, locationId?: string) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Vehicle>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  getVehicleById: (id: string) => Vehicle | undefined;
}

export interface UseLoadVehiclesResult {
  vehicles: Vehicle[];
  isLoading: boolean;
}
