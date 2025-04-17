
import React, { useEffect, useState } from "react";
import { WashRequest, Vehicle, VehicleWashStatus } from "@/models/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { Label } from "@/components/ui/label";
import { FileText, Image, Loader2 } from "lucide-react";
import { useVehicleWashStatus } from "@/hooks/useVehicleWashStatus";

interface CompletedWashDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  washRequest: WashRequest | null;
}

export const CompletedWashDetailDialog = ({
  open,
  onOpenChange,
  washRequest
}: CompletedWashDetailDialogProps) => {
  const [activeTab, setActiveTab] = React.useState<string>("");
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleWashStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { fetchWashStatusesByWashId } = useVehicleWashStatus();
  
  // Initialize when wash request changes
  useEffect(() => {
    if (washRequest && open) {
      loadWashStatusData();
      
      // Set active tab to first vehicle if available
      if (washRequest.vehicleDetails && washRequest.vehicleDetails.length > 0) {
        setActiveTab(washRequest.vehicleDetails[0].id);
      }
    }
  }, [washRequest, open]);
  
  const loadWashStatusData = async () => {
    if (!washRequest) return;
    
    setIsLoading(true);
    try {
      // Fetch wash status data from database
      const statuses = await fetchWashStatusesByWashId(washRequest.id);
      setVehicleStatuses(statuses);
    } catch (e) {
      console.error("Failed to load wash status data:", e);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!washRequest || !washRequest.vehicleDetails) return null;
  
  const getVehicleStatus = (vehicleId: string) => {
    return vehicleStatuses.find(status => status.vehicleId === vehicleId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completed Wash Details</DialogTitle>
          <DialogDescription>
            View details about this completed wash from {format(washRequest.updatedAt, "MMM dd, yyyy")}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : washRequest.vehicleDetails.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            No vehicle information available
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="w-full overflow-x-auto flex whitespace-nowrap">
              {washRequest.vehicleDetails.map((vehicle, index) => (
                <TabsTrigger key={vehicle.id} value={vehicle.id}>
                  Vehicle {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {washRequest.vehicleDetails.map(vehicle => {
              const vehicleStatus = getVehicleStatus(vehicle.id);
              
              return (
                <TabsContent key={vehicle.id} value={vehicle.id}>
                  <div className="space-y-6">
                    <VehicleCard vehicle={vehicle} className="mt-2" />
                    
                    {vehicleStatus ? (
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          {vehicleStatus.notes && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-medium">Technician Notes</Label>
                              </div>
                              <div className="bg-muted p-3 rounded-md text-sm">
                                {vehicleStatus.notes}
                              </div>
                            </div>
                          )}
                          
                          {vehicleStatus.postWashPhoto && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Image className="h-4 w-4 text-muted-foreground" />
                                <Label className="font-medium">Post-Wash Photo</Label>
                              </div>
                              <div className="flex justify-center">
                                <img
                                  src={vehicleStatus.postWashPhoto}
                                  alt="Post-wash vehicle"
                                  className="max-h-60 rounded-md border"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No wash details available for this vehicle
                      </div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
