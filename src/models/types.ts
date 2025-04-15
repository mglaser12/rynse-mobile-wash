
export type Vehicle = {
  id: string;
  customerId: string;
  type: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  color: string;
  image?: string;
  vinNumber?: string;
  dateAdded: Date;
};

export type WashStatus = 
  | "pending" 
  | "confirmed" 
  | "in_progress" 
  | "completed" 
  | "cancelled";

export type WashRequest = {
  id: string;
  customerId: string;
  vehicles: string[]; // Array of vehicle IDs
  preferredDates: {
    start: Date;
    end?: Date;
  };
  status: WashStatus;
  technician?: string; // Technician ID
  price: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SupabaseVehicle = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string | null;
  color: string | null;
  type: string | null;
  vin_number: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SupabaseWashRequest = {
  id: string;
  user_id: string;
  preferred_date_start: string;
  preferred_date_end: string | null;
  status: string;
  technician_id: string | null;
  price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SupabaseWashRequestVehicle = {
  id: string;
  wash_request_id: string;
  vehicle_id: string;
  created_at: string;
};
