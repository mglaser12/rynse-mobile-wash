
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Clock, User, Camera, FileText } from "lucide-react";
import { WashRequest, VehicleWashStatus } from "@/models/types";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { supabase } from "@/integrations/supabase/client";

interface CompletedWashDialogProps {
  washRequest: WashRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to map Supabase response to our VehicleWashStatus type
const mapSupabaseToVehicleWashStatus = (data: any): VehicleWashStatus => {
  return {
    id: data.id,
    vehicleId: data.vehicle_id,
    washRequestId: data.wash_request_id,
    technicianId: data.technician_id,
    completed: data.completed,
    postWashPhoto: data.post_wash_photo,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  };
};

export function CompletedWashDialog({ washRequest, open, onOpenChange }: CompletedWashDialogProps) {
  const [technicianName, setTechnicianName] = useState<string>("");
  const [vehicleWashStatuses, setVehicleWashStatuses] = useState<VehicleWashStatus[]>([]);
  
  useEffect(() => {
    const fetchTechnicianName = async () => {
      if (washRequest.technician) {
        console.log("Fetching technician name for ID:", washRequest.technician);
        
        // Fix: Use correct query parameter structure for Supabase client
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', washRequest.technician)
          .single();
          
        if (error) {
          console.error("Error fetching technician name:", error);
          return;
        }
        
        if (data?.name) {
          console.log("Found technician name:", data.name);
          setTechnicianName(data.name);
        } else {
          console.log("No technician name found");
        }
      }
    };
    
    const fetchVehicleWashStatuses = async () => {
      const { data, error } = await supabase
        .from('vehicle_wash_statuses')
        .select('*')
        .eq('wash_request_id', washRequest.id);
      
      if (error) {
        console.error("Error fetching vehicle wash statuses:", error);
        return;
      }
      
      if (data) {
        // Map the response data to our VehicleWashStatus type
        const mappedData = data.map(mapSupabaseToVehicleWashStatus);
        setVehicleWashStatuses(mappedData);
      }
    };
    
    fetchTechnicianName();
    fetchVehicleWashStatuses();
  }, [washRequest.technician, washRequest.id]);

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
              
              {technicianName ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">Technician:</Label>
                  <span>{technicianName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">Technician:</Label>
                  <span className="text-muted-foreground">Not assigned</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Details with Photos and Notes */}
          {washRequest.vehicleDetails?.map(vehicle => {
            const vehicleStatus = vehicleWashStatuses.find(
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
                      
                      {vehicleStatus.notes && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-medium">Technician Notes</Label>
                          </div>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            {vehicleStatus.notes}
                          </div>
                        </div>
                      )}
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
