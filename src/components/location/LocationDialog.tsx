
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Location } from "@/models/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { LocationForm } from "./LocationForm";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
}

export function LocationDialog({ open, onOpenChange, location }: LocationDialogProps) {
  const isMobile = useIsMobile();

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onOpenChange(false);
  };

  // Determine dialog content styles based on device
  const dialogContentClass = isMobile 
    ? "sm:max-w-[95%] max-h-[80vh] overflow-y-auto p-4" 
    : "sm:max-w-[550px] max-h-[85vh] overflow-y-auto";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>
            {location 
              ? "Update the details for this location." 
              : "Enter the details for the new location."}
          </DialogDescription>
        </DialogHeader>
        
        <LocationForm 
          location={location}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
