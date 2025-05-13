
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

export interface CreateWashRequestData {
  customerId: string;
  vehicles: string[];
  preferredDates: {
    start: Date;
    end?: Date;
  };
  price: number;
  notes?: string;
  locationId?: string; // Add locationId field to the wash request data
  recurringFrequency?: RecurringFrequency; // Add recurring frequency
  recurringCount?: number; // Optional count of recurring instances
}
