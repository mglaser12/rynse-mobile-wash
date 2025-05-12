
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";

type MapContextType = {
  mapboxToken: string | null;
  setMapboxToken: (token: string) => void;
  isMapAvailable: boolean;
};

const MapContext = createContext<MapContextType>({
  mapboxToken: null,
  setMapboxToken: () => {},
  isMapAvailable: false,
});

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mapboxToken, setMapboxTokenState] = useState<string | null>(
    localStorage.getItem('mapbox_token')
  );
  const [isMapAvailable, setIsMapAvailable] = useState<boolean>(!!mapboxToken);

  const setMapboxToken = (token: string) => {
    localStorage.setItem('mapbox_token', token);
    setMapboxTokenState(token);
    setIsMapAvailable(true);
    toast.success("Map functionality enabled");
  };

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxTokenState(savedToken);
      setIsMapAvailable(true);
    }
  }, []);

  const value = {
    mapboxToken,
    setMapboxToken,
    isMapAvailable,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
