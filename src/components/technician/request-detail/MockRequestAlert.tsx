
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const MockRequestAlert = () => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        This is demo data shown due to connection issues. Actions may not be saved.
      </AlertDescription>
    </Alert>
  );
};
