
import React from "react";
import { Card } from "@/components/ui/card";

interface PriceSummaryProps {
  vehicleCount: number;
  pricePerVehicle?: number;
  className?: string;
  showCard?: boolean;
}

export function PriceSummary({ 
  vehicleCount, 
  pricePerVehicle = 39.99, 
  className = "",
  showCard = true
}: PriceSummaryProps) {
  const calculatePrice = () => {
    return vehicleCount * pricePerVehicle;
  };
  
  if (vehicleCount === 0) return null;
  
  const summaryContent = (
    <div className={`${className}`}>
      <div className="flex items-center justify-between font-medium">
        <span>Price Estimate:</span>
        <span className="text-lg">${calculatePrice().toFixed(2)}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Price based on {vehicleCount} vehicle{vehicleCount !== 1 && "s"} at ${pricePerVehicle.toFixed(2)} each.
      </p>
    </div>
  );
  
  if (showCard) {
    return (
      <Card className="bg-muted p-4 rounded-lg">
        {summaryContent}
      </Card>
    );
  }
  
  return summaryContent;
}
