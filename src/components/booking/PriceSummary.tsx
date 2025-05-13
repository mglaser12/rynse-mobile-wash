
import React from "react";
import { Card } from "@/components/ui/card";
import { RecurringFrequency } from "@/models/types";

interface PriceSummaryProps {
  vehicleCount: number;
  className?: string;
  showCard?: boolean;
  recurringFrequency?: RecurringFrequency;
}

export function PriceSummary({ 
  vehicleCount, 
  className = "",
  showCard = true,
  recurringFrequency
}: PriceSummaryProps) {
  if (vehicleCount === 0) return null;

  const getFrequencyText = () => {
    if (!recurringFrequency || recurringFrequency === "none") return "";
    
    const frequencyMap = {
      weekly: "Weekly",
      biweekly: "Every two weeks",
      monthly: "Monthly"
    };
    
    return ` (${frequencyMap[recurringFrequency]})`;
  };
  
  const summaryContent = (
    <div className={`${className}`}>
      <div className="flex items-center justify-between font-medium">
        <span>Service Summary:</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {vehicleCount} vehicle{vehicleCount !== 1 && "s"}{getFrequencyText()}
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
