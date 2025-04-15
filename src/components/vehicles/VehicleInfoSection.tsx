
import React from "react";
import { Info } from "lucide-react";

export function VehicleInfoSection() {
  return (
    <div className="text-sm text-muted-foreground mb-6">
      <h3 className="font-medium text-foreground mb-2 flex items-center">
        <Info className="h-4 w-4 mr-1" />
        About Vehicle Management
      </h3>
      <p className="mb-2">
        Add all your vehicles to easily schedule washes for them.
        Our OCR technology will automatically detect vehicle information when you upload images.
      </p>
      <p className="mb-2">
        For heavy duty vehicles, we recommend uploading clear images showing the make, model, 
        and any identifying features to help our technicians prepare appropriate cleaning equipment.
      </p>
      <p>
        You can update or remove vehicles at any time.
      </p>
    </div>
  );
}
