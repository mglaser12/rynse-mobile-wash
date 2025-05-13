// Add the UserRole type to the existing types
export type UserRole = "fleet_manager" | "technician" | "admin";

// Add RecurringFrequency type
export type RecurringFrequency = "none" | "weekly" | "biweekly" | "monthly" | "quarterly";

// Add VehicleServiceType
export type VehicleServiceType = "exterior-wash" | "interior-clean" | "trailer-washout";

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
  organizationId?: string; // Organization ID field
  assetNumber?: string; // Add the asset_number field
};

export type WashStatus = 
  | "pending" 
  | "confirmed" 
  | "in_progress" 
  | "completed" 
  | "cancelled";

// Vehicle service selection for wash requests
export type VehicleServiceSelection = {
  vehicleId: string;
  services: VehicleServiceType[];
};

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
  organizationId?: string; // Organization ID field
  vehicleWashStatuses?: VehicleWashStatus[]; // Added reference to vehicle wash statuses
  location?: { // Add location property
    name: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  locationId?: string; // Reference to location ID 
  locationDetail?: Location; // Full location details
  photos?: string[]; // Add photos property to store images taken during wash
  recurring?: {
    frequency: RecurringFrequency;
    count?: number; // How many times it should be repeated (optional)
  };
  vehicleServices?: VehicleServiceSelection[]; // Services selected for each vehicle
};

// New type to track the wash status for each vehicle
export type VehicleWashStatus = {
  id?: string;
  vehicleId: string;
  washRequestId?: string;
  technicianId?: string;
  completed: boolean;
  postWashPhoto?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// New Location type
export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isDefault: boolean;
  organizationId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  vehicleCount?: number; // Number of vehicles at this location (computed)
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
  organization_id: string | null; // Organization ID field
  asset_number: string | null; // Add the asset_number field
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
  location_id?: string;
  location_detail_id?: string;
  recurring_frequency?: string | null;
  recurring_count?: number | null;
  metadata?: {
    vehicleServices?: {
      vehicleId: string;
      services: string[];
    }[];
  } | null;
};

export type SupabaseWashRequestVehicle = {
  id: string;
  wash_request_id: string;
  vehicle_id: string;
  created_at: string;
};

export type SupabaseVehicleWashStatus = {
  id: string;
  wash_request_id: string;
  vehicle_id: string;
  technician_id: string | null;
  completed: boolean;
  notes: string | null;
  post_wash_photo: string | null;
  created_at: string;
  updated_at: string;
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

export type SupabaseLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  is_default: boolean | null;
  organization_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SupabaseLocationVehicle = {
  id: string;
  location_id: string;
  vehicle_id: string;
  created_at: string;
};
