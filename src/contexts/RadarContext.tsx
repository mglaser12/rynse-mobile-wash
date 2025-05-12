
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
    const loadRadarScript = async () => {
      // Check if Radar is already loaded
      if (window.radar) {
        console.log("Radar SDK already loaded");
        
        // If Radar is loaded, check if it's also initialized
        const savedKey = localStorage.getItem("radar_publishable_key");
        if (savedKey) {
          console.log("Found saved Radar key, initializing");
          await initializeRadar(savedKey);
        }
        return;
      }
      
      console.log("Loading Radar SDK script");
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://js.radar.com/v3/radar.min.js";
        script.async = true;
        script.onload = () => {
          console.log("Radar SDK script loaded successfully");
          
          // After loading the script, check for a saved key and initialize
          const savedKey = localStorage.getItem("radar_publishable_key");
          if (savedKey) {
            console.log("Found saved Radar key after script load, initializing");
            initializeRadar(savedKey)
              .then(() => resolve())
              .catch(reject);
          } else {
            resolve();
          }
        };
        script.onerror = (error) => {
          console.error("Failed to load Radar SDK:", error);
          reject(new Error("Failed to load Radar SDK"));
        };
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
        console.error("Radar SDK not loaded yet");
        throw new Error("Radar SDK not loaded");
      }

      console.log("Initializing Radar with key:", publishableKey.substring(0, 5) + "...");
      window.radar.initialize(publishableKey);
      setIsInitialized(true);
      
      // Save the key for future use
      localStorage.setItem("radar_publishable_key", publishableKey);
      
      console.log("Radar initialized successfully");
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
