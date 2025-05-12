
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface RadarContextType {
  isLoading: boolean;
  isInitialized: boolean;
  initializeRadar: (publishableKey: string) => Promise<boolean>;
  trackUser: (userId: string, locationContext?: any) => Promise<boolean>;
  scriptLoaded: boolean;
  getRadarInstance: () => any | null;
}

// Create a context with default values
const RadarContext = createContext<RadarContextType>({} as RadarContextType);

// Hook to use the Radar context
export const useRadar = () => useContext(RadarContext);

export const RadarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Function to safely get the Radar instance
  const getRadarInstance = useCallback((): any | null => {
    if (typeof window !== 'undefined' && window.radar) {
      return window.radar;
    }
    return null;
  }, []);

  // Check if Radar is ready with retries
  const checkRadarReady = useCallback((maxRetries = 5, retryInterval = 300): Promise<boolean> => {
    return new Promise((resolve) => {
      let retries = 0;
      
      const check = () => {
        if (typeof window !== 'undefined' && window.radar) {
          console.log("Radar SDK is available");
          resolve(true);
          return;
        }
        
        retries++;
        if (retries >= maxRetries) {
          console.error(`Radar SDK not available after ${maxRetries} retries`);
          resolve(false);
          return;
        }
        
        console.log(`Waiting for Radar SDK (attempt ${retries}/${maxRetries})...`);
        setTimeout(check, retryInterval);
      };
      
      check();
    });
  }, []);

  // Load the Radar SDK script
  useEffect(() => {
    const loadRadarScript = async () => {
      // Check if Radar is already loaded
      if (window.radar) {
        console.log("Radar SDK already loaded");
        setScriptLoaded(true);
        
        // If Radar is loaded, check if it's also initialized
        const savedKey = localStorage.getItem("radar_publishable_key");
        if (savedKey) {
          console.log("Found saved Radar key, initializing");
          await initializeRadar(savedKey);
        }
        return;
      }
      
      console.log("Loading Radar SDK script");
      try {
        const script = document.createElement("script");
        script.src = "https://js.radar.com/v3/radar.min.js";
        script.async = true;
        
        const onScriptLoad = async () => {
          console.log("Radar SDK script loaded successfully");
          
          // Wait a moment to ensure the script is fully initialized
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify Radar object is available
          if (typeof window !== 'undefined' && window.radar) {
            console.log("Radar object is available after script load");
            setScriptLoaded(true);
            setScriptError(null);
            
            // After loading the script, check for a saved key and initialize
            const savedKey = localStorage.getItem("radar_publishable_key");
            if (savedKey) {
              console.log("Found saved Radar key after script load, initializing");
              initializeRadar(savedKey).catch(err => {
                console.error("Error initializing Radar after script load:", err);
              });
            }
          } else {
            console.error("Radar object not available despite script loading");
            setScriptLoaded(false);
            setScriptError(new Error("Radar SDK failed to initialize properly"));
            toast.error("Map service failed to load properly. Please refresh the page.");
          }
        };
        
        script.onload = onScriptLoad;
        
        script.onerror = (error) => {
          console.error("Failed to load Radar SDK:", error);
          toast.error("Failed to load mapping capabilities");
          setScriptLoaded(false);
          setScriptError(new Error("Failed to load Radar SDK script"));
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error("Error in script loading process:", error);
        setScriptLoaded(false);
        setScriptError(error instanceof Error ? error : new Error("Unknown error loading Radar SDK"));
      }
    };

    loadRadarScript().catch(error => {
      console.error("Error loading Radar SDK:", error);
      toast.error("Failed to load mapping capabilities");
    });
  }, []);

  const initializeRadar = useCallback(async (publishableKey: string): Promise<boolean> => {
    setIsLoading(true);
    console.log("Starting Radar initialization process with key:", publishableKey.substring(0, 10) + "...");
    
    try {
      // First ensure the script is available with retries
      const isReady = await checkRadarReady();
      
      if (!isReady) {
        console.error("Radar SDK not loaded yet despite retries");
        setIsLoading(false);
        toast.error("Map service not available yet. Please refresh and try again.");
        return false;
      }

      console.log("Radar SDK verified, proceeding with initialization");
      
      // Initialize Radar with the provided key
      window.radar.initialize(publishableKey);
      
      // Add a small delay to ensure initialization completes
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if initialization was successful by attempting to use the API
      try {
        const contextResult = await window.radar.getContext();
        console.log("Radar initialized successfully, context:", contextResult);
        setIsInitialized(true);
        
        // Save the key for future use
        localStorage.setItem("radar_publishable_key", publishableKey);
        return true;
      } catch (err) {
        console.error("Radar initialization verification failed:", err);
        toast.error("Could not verify map service initialization");
        return false;
      }
    } catch (error) {
      console.error("Error initializing Radar:", error);
      toast.error("Failed to initialize mapping service");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkRadarReady]);

  const trackUser = useCallback(async (userId: string, locationContext: any = {}): Promise<boolean> => {
    try {
      // Verify Radar is available and initialized
      const radar = getRadarInstance();
      if (!radar || !isInitialized) {
        console.warn("Radar not initialized or available, cannot track user");
        return false;
      }

      await radar.setUserId(userId);
      if (Object.keys(locationContext).length > 0) {
        await radar.setMetadata(locationContext);
      }
      
      const result = await radar.trackOnce();
      return result.status === "SUCCESS";
    } catch (error) {
      console.error("Error tracking user location:", error);
      return false;
    }
  }, [getRadarInstance, isInitialized]);

  // Provide context value
  const contextValue: RadarContextType = {
    isLoading,
    isInitialized,
    initializeRadar,
    trackUser,
    scriptLoaded,
    getRadarInstance
  };

  return (
    <RadarContext.Provider value={contextValue}>
      {children}
    </RadarContext.Provider>
  );
};
