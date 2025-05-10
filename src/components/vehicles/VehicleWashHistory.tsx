
import React, { useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Clock, MapPin, FileText, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useVehicleWashHistory } from "@/hooks/useVehicleWashHistory";
import { Vehicle, WashRequest } from "@/models/types";
import { CompletedWashDialog } from "@/components/wash/CompletedWashDialog";
import { useWashContext } from "@/contexts/wash/useWashContext";

interface VehicleWashHistoryProps {
  vehicle: Vehicle;
  onEditVehicle?: () => void;
}

export function VehicleWashHistory({ vehicle, onEditVehicle }: VehicleWashHistoryProps) {
  const { history, isLoading } = useVehicleWashHistory(vehicle.id);
  const [selectedWashId, setSelectedWashId] = useState<string | null>(null);
  const { getWashRequestById } = useWashContext();

  // Get the selected wash request details
  const selectedWashRequest = selectedWashId ? getWashRequestById(selectedWashId) : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {vehicle.make} {vehicle.model} Wash History
        </h3>
        {onEditVehicle && (
          <Button variant="outline" size="sm" onClick={onEditVehicle}>
            Edit Vehicle
          </Button>
        )}
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading wash history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h4 className="text-lg font-medium">No wash history</h4>
          <p className="text-muted-foreground mt-1">
            This vehicle hasn't been washed through our service yet.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedWashId(item.washRequestId)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">
                      {format(item.date, "MMMM d, yyyy")}
                    </CardTitle>
                    <Badge variant="outline">{format(item.date, "h:mm a")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.location && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{item.location}</span>
                    </div>
                  )}
                  
                  {item.notes && (
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{item.notes}</span>
                    </div>
                  )}
                  
                  {item.photoUrl && (
                    <div className="mt-2">
                      <img 
                        src={item.photoUrl} 
                        alt="After wash" 
                        className="rounded-md w-full h-auto max-h-40 object-cover" 
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {selectedWashRequest && (
        <CompletedWashDialog
          washRequest={selectedWashRequest}
          open={!!selectedWashId}
          onOpenChange={(open) => {
            if (!open) setSelectedWashId(null);
          }}
        />
      )}
    </div>
  );
}
