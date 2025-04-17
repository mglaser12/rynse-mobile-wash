
import { Location, SupabaseLocation } from "@/models/types";

export interface LocationContextType {
  locations: Location[];
  defaultLocation: Location | null;
  isLoading: boolean;
  createLocation: (locationData: Omit<Location, "id" | "createdAt" | "updatedAt" | "createdBy" | "vehicleCount">) => Promise<Location | null>;
  updateLocation: (id: string, locationData: Partial<Location>) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
  setLocationAsDefault: (id: string) => Promise<boolean>;
  getLocationById: (id: string) => Location | undefined;
  refreshLocations: () => Promise<void>;
}
