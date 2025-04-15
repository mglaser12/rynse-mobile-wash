
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const VehicleWashProgressHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle>Wash Progress</DialogTitle>
      <DialogDescription>
        Record information for each vehicle as you complete the wash.
      </DialogDescription>
    </DialogHeader>
  );
};
