
import React, { createContext, useContext, useEffect } from "react";
import { LocationContextType } from "./types";
import { useLocationOperations } from "./useLocationOperations";
import { useAuth } from "@/contexts/AuthContext";

// Create the context with a default value
const LocationContext = createContext<LocationContextType>({} as LocationContextType);

// Custom hook to use the location context
export const useLocations = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const {
    locations,
    defaultLocation,
    isLoading,
    loadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    setLocationAsDefault,
    getLocationById,
    refreshLocations
  } = useLocationOperations();

  // Load locations when the component mounts and when user changes
  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user]);

  // Context value
  const value = {
    locations,
    defaultLocation,
    isLoading,
    createLocation,
    updateLocation,
    deleteLocation,
    setLocationAsDefault,
    getLocationById,
    refreshLocations
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
