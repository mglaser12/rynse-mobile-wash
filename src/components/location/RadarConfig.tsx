
import React, { useState, useEffect } from "react";
import { useRadar } from "@/contexts/RadarContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface RadarConfigProps {
  onInitialized: () => void;
}

export function RadarConfig({ onInitialized }: RadarConfigProps) {
  // Default value is now the updated key
  const [publishableKey, setPublishableKey] = useState("prj_live_sk_5b5015129ef5dcc3472795775d1b174aa0249172");
  const [initAttempted, setInitAttempted] = useState(false);
  const [pendingInit, setPendingInit] = useState(false);
  const { isLoading, initializeRadar, isInitialized, scriptLoaded, getRadarInstance } = useRadar();

  // Check when script loads or initialization changes
  useEffect(() => {
    // If already initialized, call onInitialized directly
    if (isInitialized) {
      console.log("Radar is already initialized in RadarConfig, calling onInitialized");
      onInitialized();
      return;
    }
    
    // If we're waiting for initialization and it's not yet attempted
    if (scriptLoaded && !initAttempted && !pendingInit && publishableKey) {
      console.log("Script loaded and not attempted yet, auto-initializing Radar");
      setPendingInit(true);
      // Small delay to ensure script is fully loaded
      setTimeout(() => {
        handleInitialize();
      }, 1000);
    }
  }, [isInitialized, scriptLoaded, initAttempted]);

  const handleInitialize = async () => {
    if (!publishableKey.trim()) {
      toast.error("Please enter a valid Radar publishable key");
      setPendingInit(false);
      return;
    }

    if (!scriptLoaded) {
      toast.error("Map service script is still loading. Please wait.");
      setPendingInit(false);
      return;
    }

    // Verify that window.radar is available
    const radar = getRadarInstance();
    if (!radar) {
      console.error("Radar instance not available before initialization");
      toast.error("Map service not fully loaded. Please refresh the page and try again.");
      setPendingInit(false);
      return;
    }

    setInitAttempted(true);
    console.log("Initializing Radar from RadarConfig component");
    
    try {
      const success = await initializeRadar(publishableKey);
      
      if (success) {
        console.log("Radar initialization successful from RadarConfig, calling onInitialized");
        toast.success("Map service initialized successfully");
        localStorage.setItem("radar_publishable_key", publishableKey);
        onInitialized();
      } else {
        console.error("Radar initialization failed");
        toast.error("Failed to initialize map service. Please check your API key.");
        setInitAttempted(false); // Allow retrying
      }
    } catch (error) {
      console.error("Error during radar initialization:", error);
      toast.error("Error initializing map service. Please try again.");
      setInitAttempted(false); // Allow retrying
    } finally {
      setPendingInit(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Map Configuration</CardTitle>
        <CardDescription>
          Enter your Radar publishable key to enable location features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="publishable-key" className="text-sm font-medium">
              Radar Publishable Key
            </label>
            <Input
              id="publishable-key"
              placeholder="prj_live_sk_..."
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              disabled={isLoading || initAttempted}
            />
            <p className="text-xs text-muted-foreground">
              You can find your publishable key in the Radar dashboard under API Keys
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleInitialize} 
          disabled={isLoading || pendingInit || !publishableKey.trim() || !scriptLoaded}
          className="w-full"
        >
          {isLoading || pendingInit ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : !scriptLoaded ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading map service...
            </>
          ) : (
            "Initialize Map"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
