
import { WashRequest, Vehicle, RecurringFrequency } from "@/models/types";

export interface WashContextType {
  washRequests: WashRequest[];
  isLoading: boolean;
  createWashRequest: (data: CreateWashRequestData) => Promise<WashRequest | null>;
  cancelWashRequest: (id: string) => Promise<boolean>;
  updateWashRequest: (id: string, data: any) => Promise<boolean>;
  removeWashRequest: (id: string) => Promise<void>;
  getWashRequestById: (id: string) => WashRequest | undefined;
  refreshData: () => Promise<void>;
}

export interface VehicleServiceData {
  vehicleId: string;
  services: string[]; // Array of service IDs
}

export interface CreateWashRequestData {
  customerId: string;
  vehicles: string[];
  preferredDates: {
    start: Date;
    end?: Date;
  };
  price: number;
  notes?: string;
  locationId?: string; 
  recurringFrequency?: RecurringFrequency;
  recurringCount?: number;
  vehicleServices?: VehicleServiceData[]; // New field for vehicle services
}
