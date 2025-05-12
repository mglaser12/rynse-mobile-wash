
import React, { useState } from "react";
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
  const [publishableKey, setPublishableKey] = useState("");
  const { isLoading, initializeRadar } = useRadar();

  const handleInitialize = async () => {
    if (!publishableKey.trim()) {
      toast.error("Please enter a valid Radar publishable key");
      return;
    }

    const success = await initializeRadar(publishableKey);
    if (success) {
      toast.success("Map service initialized successfully");
      localStorage.setItem("radar_publishable_key", publishableKey);
      onInitialized();
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
          disabled={isLoading || !publishableKey.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            "Initialize Map"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
