
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

export type WashLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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
  location: WashLocation;
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
