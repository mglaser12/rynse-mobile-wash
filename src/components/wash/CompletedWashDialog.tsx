
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Clock, User, Camera } from "lucide-react";
import { WashRequest } from "@/models/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { supabase } from "@/integrations/supabase/client";

interface CompletedWashDialogProps {
  washRequest: WashRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompletedWashDialog({ washRequest, open, onOpenChange }: CompletedWashDialogProps) {
  const [technicianName, setTechnicianName] = useState<string>("");
  
  useEffect(() => {
    const fetchTechnicianName = async () => {
      if (washRequest.technician) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', washRequest.technician)
          .single();
          
        if (data?.name) {
          setTechnicianName(data.name);
        }
      }
    };
    
    fetchTechnicianName();
  }, [washRequest.technician]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Completed Wash Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Completion Info Card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Completed At:</Label>
                <span>{format(washRequest.updatedAt, "PPp")}</span>
              </div>
              
              {technicianName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">Technician:</Label>
                  <span>{technicianName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Details with Photos */}
          {washRequest.vehicleDetails?.map(vehicle => {
            const vehicleStatus = washRequest.vehicleWashStatuses?.find(
              status => status.vehicleId === vehicle.id
            );
            
            return (
              <div key={vehicle.id} className="space-y-4">
                <VehicleCard vehicle={vehicle} />
                
                {vehicleStatus?.postWashPhoto && (
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-medium">Post-Wash Photo</Label>
                      </div>
                      <div className="flex justify-center">
                        <img
                          src={vehicleStatus.postWashPhoto}
                          alt="Post-wash vehicle"
                          className="max-h-60 rounded-md border"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
