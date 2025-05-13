
import React from "react";
import { WashRequest, WashStatus } from "@/models/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistance } from "date-fns";
import { Repeat } from "lucide-react";

interface WashRequestCardProps {
  washRequest: WashRequest;
  actions?: React.ReactNode;
  onClick?: () => void;
}

const formatRecurring = (frequency?: string): string => {
  if (!frequency || frequency === 'none') return '';
  
  const formatted = {
    'weekly': 'Weekly',
    'biweekly': 'Every 2 Weeks',
    'monthly': 'Monthly',
    'quarterly': 'Every 3 Months'
  }[frequency] || frequency.charAt(0).toUpperCase() + frequency.slice(1);
  
  return formatted;
};

const WashStatusBadge: React.FC<{ status: WashStatus }> = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    confirmed: "bg-blue-500 hover:bg-blue-600",
    in_progress: "bg-purple-500 hover:bg-purple-600",
    completed: "bg-green-500 hover:bg-green-600",
    cancelled: "bg-gray-500 hover:bg-gray-600"
  };
  
  const statusText = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  
  return (
    <Badge className={statusStyles[status]}>
      {statusText[status]}
    </Badge>
  );
};

export function WashRequestCard({ washRequest, actions, onClick }: WashRequestCardProps) {
  const { id, preferredDates, vehicles, vehicleDetails, status, location, recurring } = washRequest;
  
  const createdAtDate = new Date(washRequest.createdAt);
  const preferredDate = new Date(preferredDates.start);
  const vehicleCount = vehicleDetails?.length || vehicles.length;
  const cardStyles = onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : "";
  const recurringLabel = recurring?.frequency ? formatRecurring(recurring.frequency) : '';
  
  return (
    <Card className={`overflow-hidden ${cardStyles}`} onClick={onClick}>
      <CardHeader className="p-4 bg-card border-b pb-2">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Requested {formatDistance(createdAtDate, new Date(), { addSuffix: true })}
            </p>
          </div>
          <WashStatusBadge status={status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">
              {vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {new Date(preferredDate).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          
          {location && (
            <div className="text-right">
              <p className="font-medium">{location.name}</p>
              <p className="text-xs text-muted-foreground">{location.address}</p>
            </div>
          )}
        </div>
        
        {recurringLabel && (
          <div className="flex items-center text-sm text-blue-600">
            <Repeat className="h-3 w-3 mr-1" />
            {recurringLabel} recurring wash
          </div>
        )}
      </CardContent>
      
      {actions && (
        <CardFooter className="px-4 py-3 bg-accent/50">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}
