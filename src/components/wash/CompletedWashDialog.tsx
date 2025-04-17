
import React from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Clock, User, Camera } from "lucide-react";
import { WashRequest } from "@/models/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

interface CompletedWashDialogProps {
  washRequest: WashRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompletedWashDialog({ washRequest, open, onOpenChange }: CompletedWashDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Completed Wash Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {washRequest.vehicleDetails?.map(vehicle => (
            <div key={vehicle.id} className="space-y-4">
              <VehicleCard vehicle={vehicle} />
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label>Completed At:</Label>
                    <span>{format(washRequest.updatedAt, "PPp")}</span>
                  </div>
                  
                  {washRequest.technician && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Label>Technician:</Label>
                      <span>{washRequest.technician}</span>
                    </div>
                  )}
                  
                  {washRequest.photos && washRequest.photos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <Label>Photos:</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {washRequest.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Wash photo ${index + 1}`}
                            className="rounded-md border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
