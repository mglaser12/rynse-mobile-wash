
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const NoVehiclesAlert = () => {
  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No vehicles found for this wash request. Please contact support.
        </AlertDescription>
      </Alert>
    </div>
  );
};
