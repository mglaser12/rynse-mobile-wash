
import { WashRequest } from "@/models/types";

export interface WashContextType {
  washRequests: WashRequest[];
  isLoading: boolean;
  createWashRequest: (requestData: CreateWashRequestData) => Promise<WashRequest | null>;
  updateWashRequest: (id: string, data: Partial<WashRequest>) => Promise<boolean>;
  removeWashRequest: (id: string) => Promise<void>;
  getWashRequestById: (id: string) => WashRequest | undefined;
  cancelWashRequest: (id: string) => Promise<boolean>;
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
}
