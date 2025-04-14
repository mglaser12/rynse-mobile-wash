
import React, { createContext, useState, useContext, useEffect } from "react";
import { WashRequest, WashLocation, WashStatus } from "../models/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Sample locations
export const WASH_LOCATIONS: WashLocation[] = [
  {
    id: "loc1",
    name: "Downtown Facility",
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    id: "loc2",
    name: "Airport Terminal",
    address: "200 Airport Blvd",
    city: "San Francisco",
    state: "CA",
    zipCode: "94128",
    coordinates: {
      latitude: 37.6213,
      longitude: -122.3790,
    },
  },
  {
    id: "loc3",
    name: "Corporate Park",
    address: "500 Technology Dr",
    city: "San Jose",
    state: "CA",
    zipCode: "95110",
    coordinates: {
      latitude: 37.3382,
      longitude: -121.8863,
    },
  },
];

// Sample wash requests
const SAMPLE_WASH_REQUESTS: WashRequest[] = [
  {
    id: "wash1",
    customerId: "1",
    vehicles: ["1"],
    location: WASH_LOCATIONS[0],
    preferredDates: {
      start: new Date(Date.now() + 86400000), // tomorrow
    },
    status: "pending",
    price: 39.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "wash2",
    customerId: "1",
    vehicles: ["1", "2"],
    location: WASH_LOCATIONS[1],
    preferredDates: {
      start: new Date(Date.now() + 172800000), // day after tomorrow
    },
    status: "confirmed",
    technician: "2",
    price: 79.98,
    createdAt: new Date(Date.now() - 86400000), // yesterday
    updatedAt: new Date(),
  },
];

interface WashContextType {
  washRequests: WashRequest[];
  locations: WashLocation[];
  isLoading: boolean;
  createWashRequest: (request: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => Promise<void>;
  updateWashRequest: (id: string, data: Partial<WashRequest>) => Promise<void>;
  cancelWashRequest: (id: string) => Promise<void>;
  getWashRequestById: (id: string) => WashRequest | undefined;
  getFilteredRequests: (status?: WashStatus, technicianId?: string) => WashRequest[];
}

const WashContext = createContext<WashContextType>({} as WashContextType);

export function useWashRequests() {
  return useContext(WashContext);
}

export function WashProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [washRequests, setWashRequests] = useState<WashRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load wash requests on mount or when user changes
  useEffect(() => {
    const loadWashRequests = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const savedRequests = localStorage.getItem("washRequests");
        if (savedRequests) {
          try {
            const parsedRequests = JSON.parse(savedRequests, (key, value) => {
              // Convert string date back to Date object
              if (key === "start" || key === "end" || key === "createdAt" || key === "updatedAt") {
                return new Date(value);
              }
              return value;
            });
            setWashRequests(parsedRequests);
          } catch (error) {
            console.error("Error parsing saved wash requests:", error);
            setWashRequests(user ? 
              (user.role === "customer" 
                ? SAMPLE_WASH_REQUESTS.filter(w => w.customerId === user.id)
                : SAMPLE_WASH_REQUESTS) 
              : []);
          }
        } else {
          // Use sample data first time
          setWashRequests(user ? 
            (user.role === "customer" 
              ? SAMPLE_WASH_REQUESTS.filter(w => w.customerId === user.id)
              : SAMPLE_WASH_REQUESTS) 
            : []);
          localStorage.setItem("washRequests", JSON.stringify(SAMPLE_WASH_REQUESTS));
        }
      } catch (error) {
        console.error("Error loading wash requests:", error);
        toast.error("Failed to load wash requests");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadWashRequests();
    } else {
      setWashRequests([]);
      setIsLoading(false);
    }
  }, [user]);

  // Create a new wash request
  const createWashRequest = async (requestData: Omit<WashRequest, "id" | "status" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("You must be logged in to create a wash request");
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const newRequest: WashRequest = {
        ...requestData,
        id: Math.random().toString(36).substring(2, 11),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedRequests = [...washRequests, newRequest];
      setWashRequests(updatedRequests);
      localStorage.setItem("washRequests", JSON.stringify(updatedRequests));
      toast.success("Wash request created successfully!");
    } catch (error) {
      console.error("Error creating wash request:", error);
      toast.error("Failed to create wash request");
    }
  };

  // Update an existing wash request
  const updateWashRequest = async (id: string, data: Partial<WashRequest>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRequests = washRequests.map(request => 
        request.id === id ? { ...request, ...data, updatedAt: new Date() } : request
      );
      
      setWashRequests(updatedRequests);
      localStorage.setItem("washRequests", JSON.stringify(updatedRequests));
      toast.success("Wash request updated successfully!");
    } catch (error) {
      console.error("Error updating wash request:", error);
      toast.error("Failed to update wash request");
    }
  };

  // Cancel a wash request
  const cancelWashRequest = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedRequests = washRequests.map(request => 
        request.id === id 
          ? { ...request, status: "cancelled" as WashStatus, updatedAt: new Date() } 
          : request
      );
      
      setWashRequests(updatedRequests);
      localStorage.setItem("washRequests", JSON.stringify(updatedRequests));
      toast.success("Wash request cancelled");
    } catch (error) {
      console.error("Error cancelling wash request:", error);
      toast.error("Failed to cancel wash request");
    }
  };

  // Get a wash request by ID
  const getWashRequestById = (id: string) => {
    return washRequests.find(request => request.id === id);
  };

  // Get filtered requests based on status and/or technician
  const getFilteredRequests = (status?: WashStatus, technicianId?: string) => {
    return washRequests.filter(request => {
      let statusMatch = true;
      let techMatch = true;
      
      if (status) {
        statusMatch = request.status === status;
      }
      
      if (technicianId) {
        techMatch = request.technician === technicianId;
      }
      
      return statusMatch && techMatch;
    });
  };

  const value = {
    washRequests,
    locations: WASH_LOCATIONS,
    isLoading,
    createWashRequest,
    updateWashRequest,
    cancelWashRequest,
    getWashRequestById,
    getFilteredRequests,
  };

  return (
    <WashContext.Provider value={value}>
      {children}
    </WashContext.Provider>
  );
}
