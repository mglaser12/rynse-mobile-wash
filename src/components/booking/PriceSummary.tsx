
import React from "react";

interface PriceSummaryProps {
  vehicleCount: number;
  pricePerVehicle?: number;
}

export function PriceSummary({ vehicleCount, pricePerVehicle = 39.99 }: PriceSummaryProps) {
  const calculatePrice = () => {
    return vehicleCount * pricePerVehicle;
  };
  
  if (vehicleCount === 0) return null;
  
  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center justify-between font-medium">
        <span>Price Estimate:</span>
        <span className="text-lg">${calculatePrice().toFixed(2)}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Price based on {vehicleCount} vehicle{vehicleCount !== 1 && "s"} at ${pricePerVehicle.toFixed(2)} each.
      </p>
    </div>
  );
}
