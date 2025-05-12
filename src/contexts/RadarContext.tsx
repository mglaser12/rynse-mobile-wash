
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface RadarContextType {
  isLoading: boolean;
  isInitialized: boolean;
  initializeRadar: (publishableKey: string) => Promise<boolean>;
  trackUser: (userId: string, locationContext?: any) => Promise<boolean>;
}

const RadarContext = createContext<RadarContextType>({} as RadarContextType);

export const useRadar = () => useContext(RadarContext);

export const RadarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Load the Radar SDK script
  useEffect(() => {
    const loadRadarScript = () => {
      if (window.radar) return Promise.resolve();
      
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://js.radar.com/v3/radar.min.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Radar SDK"));
        document.head.appendChild(script);
      });
    };

    loadRadarScript()
      .catch(error => {
        console.error("Error loading Radar SDK:", error);
        toast.error("Failed to load mapping capabilities");
      });
  }, []);

  const initializeRadar = async (publishableKey: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!window.radar) {
        throw new Error("Radar SDK not loaded");
      }

      window.radar.initialize(publishableKey);
      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error("Error initializing Radar:", error);
      toast.error("Failed to initialize mapping service");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const trackUser = async (userId: string, locationContext: any = {}): Promise<boolean> => {
    try {
      if (!window.radar || !isInitialized) {
        throw new Error("Radar not initialized");
      }

      await window.radar.setUserId(userId);
      if (Object.keys(locationContext).length > 0) {
        await window.radar.setMetadata(locationContext);
      }
      
      const result = await window.radar.trackOnce();
      return result.status === "SUCCESS";
    } catch (error) {
      console.error("Error tracking user location:", error);
      return false;
    }
  };

  return (
    <RadarContext.Provider value={{
      isLoading,
      isInitialized,
      initializeRadar,
      trackUser,
    }}>
      {children}
    </RadarContext.Provider>
  );
};
