
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
  // Default value is now the provided key
  const [publishableKey, setPublishableKey] = useState("prj_live_pk_560d2a5b5bfcbd600e4b0f31e0962eb1a25b27a5");
  const { isLoading, initializeRadar, isInitialized, scriptLoaded } = useRadar();

  // Auto-initialize on component mount
  useEffect(() => {
    // Check if Radar is already initialized
    if (isInitialized) {
      console.log("Radar is already initialized, calling onInitialized");
      onInitialized();
      return;
    }
    
    // Only try to initialize if the script is loaded
    if (scriptLoaded && publishableKey) {
      console.log("Auto-initializing Radar with key");
      handleInitialize();
    }
  }, [isInitialized, scriptLoaded]);

  const handleInitialize = async () => {
    if (!publishableKey.trim()) {
      toast.error("Please enter a valid Radar publishable key");
      return;
    }

    if (!scriptLoaded) {
      toast.error("Map service script is still loading. Please wait.");
      return;
    }

    console.log("Initializing Radar from RadarConfig component");
    const success = await initializeRadar(publishableKey);
    if (success) {
      console.log("Radar initialization successful, calling onInitialized");
      toast.success("Map service initialized successfully");
      localStorage.setItem("radar_publishable_key", publishableKey);
      onInitialized();
    } else {
      toast.error("Failed to initialize map service. Please check your API key.");
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
              placeholder="prj_live_pk_..."
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
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
          disabled={isLoading || !publishableKey.trim() || !scriptLoaded}
          className="w-full"
        >
          {isLoading ? (
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
