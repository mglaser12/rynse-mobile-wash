
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WashRequest } from "@/models/types";
import { useVehicles } from "@/contexts/VehicleContext";
import { Calendar, Car, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/contexts/LocationContext";
import { CompletedWashDialog } from "@/components/wash/CompletedWashDialog";
import { PriceSummary } from "@/components/booking/PriceSummary";

interface WashRequestCardProps {
  washRequest: WashRequest;
  onClick?: () => void;
  actions?: React.ReactNode;
  showDetailsButton?: boolean;
}

export function WashRequestCard({
  washRequest,
  onClick,
  actions,
  showDetailsButton = false
}: WashRequestCardProps) {
  const [showCompletedDialog, setShowCompletedDialog] = useState(false);
  const { vehicles } = useVehicles();
  const { locations } = useLocations();

  // Use either vehicleDetails from the request or find them in the vehicles context
  // Filter out any null or undefined values to prevent errors
  const requestVehicles = washRequest.vehicleDetails && washRequest.vehicleDetails.length > 0 ? washRequest.vehicleDetails.filter(vehicle => vehicle !== null && vehicle !== undefined) : vehicles.filter(v => washRequest.vehicles && washRequest.vehicles.includes(v.id));

  // Get location information
  const locationInfo = washRequest.locationId ? locations.find(loc => loc.id === washRequest.locationId) : washRequest.location?.name ? {
    name: washRequest.location.name
  } : null;
  
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };
  
  const statusMessages: Record<string, string> = {
    pending: "Awaiting confirmation",
    confirmed: "Scheduled",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  
  const formatDateRange = () => {
    const {
      start,
      end
    } = washRequest.preferredDates;
    if (!end) {
      return format(start, "MMM dd, yyyy");
    }
    return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
  };

  // Format the header date based on status
  const formatHeaderDate = () => {
    if (washRequest.status === "completed") {
      return format(washRequest.updatedAt, "MMM dd, yyyy");
    } else {
      return formatDateRange();
    }
  };

  const handleClick = () => {
    if (washRequest.status === "completed") {
      setShowCompletedDialog(true);
    } else if (onClick) {
      onClick();
    }
  };

  // Calculate vehicle count
  const vehicleCount = requestVehicles?.length || 0;

  return (
    <>
      <Card 
        className={`overflow-hidden ${onClick || washRequest.status === "completed" ? "cursor-pointer hover:border-primary transition-colors" : ""}`} 
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge className={`${statusColors[washRequest.status]}`}>
                {statusMessages[washRequest.status]}
              </Badge>
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatHeaderDate()}
              </h4>
            </div>
            <div className="text-right">
              <p className="font-medium">${washRequest.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {format(washRequest.createdAt, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
          
          <div className="mt-3 space-y-2 text-sm">
            {/* Location information */}
            {locationInfo && <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{locationInfo.name}</span>
              </div>}
            
            {/* Vehicle information */}
            <div className="flex gap-2">
              <Car className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                {requestVehicles.length > 0 ? (
                  <>
                    {requestVehicles.length} Vehicle{requestVehicles.length !== 1 && "s"}: {" "}
                    {requestVehicles.slice(0, 2).map((vehicle, index) => (
                      <span key={vehicle.id || index}>
                        {vehicle.make} {vehicle.model}
                        {index < Math.min(requestVehicles.length, 2) - 1 && ", "}
                      </span>
                    ))}
                    {requestVehicles.length > 2 && ` +${requestVehicles.length - 2} more`}
                  </>
                ) : (
                  <span>No vehicles</span>
                )}
              </div>
            </div>
            
            {/* Price estimate */}
            <PriceSummary 
              vehicleCount={vehicleCount} 
              showCard={false} 
              className="mt-3 pt-3 border-t border-muted" 
            />
          </div>
          
          {actions && <div className="mt-4">{actions}</div>}
          
          {showDetailsButton && washRequest.status === "completed" && !onClick && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompletedDialog(true);
                }}
              >
                View Wash Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showCompletedDialog && (
        <CompletedWashDialog
          washRequest={washRequest}
          open={showCompletedDialog}
          onOpenChange={setShowCompletedDialog}
        />
      )}
    </>
  );
}
