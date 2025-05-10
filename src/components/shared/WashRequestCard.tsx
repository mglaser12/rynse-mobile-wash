
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { WashRequest, WashStatus } from "@/models/types";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, MapPin, Info, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import { PwaDialogContent } from "@/components/ui/pwa-dialog"; // Use the PWA-optimized dialog
import { EditWashRequestForm } from "@/components/booking/EditWashRequestForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useWashRequests } from "@/contexts/WashContext";
import { useState, useEffect, useRef } from "react";

interface WashRequestCardProps {
  washRequest: WashRequest;
  onClick?: () => void;
  actions?: React.ReactNode;
  showDetailsButton?: boolean;
}

const statusLabels: Record<WashStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusColors: Record<WashStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const WashRequestCard = ({
  washRequest,
  onClick,
  actions,
  showDetailsButton = false,
}: WashRequestCardProps) => {
  const { cancelWashRequest } = useWashRequests();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogClosingRef = useRef(false);

  // Handle proper cleanup when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      // Ensure we're not leaving any pending state when component unmounts
      dialogClosingRef.current = false;
    };
  }, []);

  // Handle dialog state changes with animation frame to prevent blocking
  const handleOpenDialogChange = (open: boolean) => {
    if (!open && !dialogClosingRef.current) {
      dialogClosingRef.current = true;
      
      // Use requestAnimationFrame to defer state update until after animations
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowEditDialog(false);
          dialogClosingRef.current = false;
        });
      });
    } else if (open) {
      setShowEditDialog(true);
    }
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleEditRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleCancelRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubmitting(true);
    
    try {
      const success = await cancelWashRequest(washRequest.id);
      if (success) {
        toast.success("Wash request cancelled successfully");
      } else {
        toast.error("Failed to cancel wash request");
      }
    } catch (error) {
      console.error("Error cancelling wash request:", error);
      toast.error("Failed to cancel wash request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const canEdit = ["pending", "confirmed"].includes(washRequest.status);
  const canCancel = ["pending", "confirmed"].includes(washRequest.status);

  const vehicles = washRequest.vehicleDetails || [];
  const location = washRequest.location;

  return (
    <>
      <Card 
        className={`overflow-hidden ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
        onClick={onClick ? handleClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span 
                  className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColors[washRequest.status]}`}
                >
                  {statusLabels[washRequest.status]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(washRequest.createdAt), { addSuffix: true })}
                </span>
              </div>
              <h3 className="font-medium">
                {vehicles.length > 0 
                  ? `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'} wash`
                  : 'Vehicle wash'}
              </h3>
            </div>

            {(canEdit || canCancel) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <DropdownMenuItem onClick={handleEditRequest}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {canCancel && (
                    <DropdownMenuItem 
                      className="text-red-600" 
                      onClick={handleCancelRequest}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Cancelling..." : "Cancel"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-start text-sm">
              <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <div>
                  {formatDate(washRequest.preferredDates.start)}
                </div>
                {washRequest.preferredDates.end && (
                  <div className="text-muted-foreground text-xs">
                    to {formatDate(washRequest.preferredDates.end)}
                  </div>
                )}
              </div>
            </div>
            
            {location && (
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>{location.name}</div>
              </div>
            )}

            {washRequest.notes && (
              <div className="flex items-start text-sm">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div className="text-muted-foreground truncate max-w-[90%]">
                  {washRequest.notes}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {vehicles.length > 0 && (
          <>
            <Separator />
            <div className="p-4 pt-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">Vehicles</div>
              <div className="flex flex-wrap gap-2">
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id}
                    className="bg-muted px-2 py-1 rounded text-xs"
                  >
                    {vehicle.make} {vehicle.model}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(actions || showDetailsButton) && (
          <CardFooter className="p-4 pt-2">
            {actions}
            {showDetailsButton && !actions && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={onClick || (() => {})}
              >
                View Details
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <Dialog open={showEditDialog} onOpenChange={handleOpenDialogChange}>
        <PwaDialogContent className="w-full max-w-lg py-6 max-h-[90vh] overflow-hidden flex flex-col">
          {showEditDialog && ( // Only render when dialog is open to prevent unnecessary operations
            <EditWashRequestForm 
              washRequest={washRequest}
              onSuccess={() => handleOpenDialogChange(false)}
              onCancel={() => handleOpenDialogChange(false)}
            />
          )}
        </PwaDialogContent>
      </Dialog>
    </>
  );
};
