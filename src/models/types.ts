
// Add the UserRole type to the existing types
export type UserRole = "fleet_manager" | "technician";

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
  organizationId?: string; // Added organization ID field
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
  vehicleDetails?: Vehicle[]; // Array of vehicle objects with all details
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
  organizationId?: string; // Added for organization visibility
};

// New type to track the wash status for each vehicle
export type VehicleWashStatus = {
  vehicleId: string;
  completed: boolean;
  postWashPhoto?: string;
  notes?: string;
};

export type Organization = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfile = {
  id: string;
  name: string;
  email?: string;
  role?: string;
  organizationId?: string;
  avatarUrl?: string;
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
  organization_id?: string;
};

export type SupabaseWashRequestVehicle = {
  id: string;
  wash_request_id: string;
  vehicle_id: string;
  created_at: string;
};

export type SupabaseProfile = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SupabaseOrganization = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};
