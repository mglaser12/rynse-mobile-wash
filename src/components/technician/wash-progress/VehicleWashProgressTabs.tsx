
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import { Vehicle, VehicleWashStatus } from "@/models/types";
import { VehicleWashForm } from "../VehicleWashForm";

interface VehicleWashProgressTabsProps {
  vehicles: Vehicle[];
  vehicleStatuses: VehicleWashStatus[];
  activeTab: string;
  onTabChange: (value: string) => void;
  onStatusUpdate: (status: VehicleWashStatus) => void;
}

export const VehicleWashProgressTabs = ({
  vehicles,
  vehicleStatuses,
  activeTab,
  onTabChange,
  onStatusUpdate
}: VehicleWashProgressTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="w-full overflow-x-auto flex whitespace-nowrap">
        {vehicles.map((vehicle, index) => {
          const status = vehicleStatuses.find(s => s.vehicleId === vehicle.id);
          const isComplete = status?.completed || false;
          
          return (
            <TabsTrigger 
              key={vehicle.id} 
              value={vehicle.id}
              className="relative px-4 py-2"
            >
              {isComplete && (
                <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1" />
              )}
              <span>
                Vehicle {index + 1}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {vehicles.map((vehicle) => {
        const status = vehicleStatuses.find(s => s.vehicleId === vehicle.id) || {
          vehicleId: vehicle.id,
          completed: false
        };
        
        return (
          <TabsContent key={vehicle.id} value={vehicle.id}>
            <VehicleWashForm 
              vehicle={vehicle}
              status={status}
              onStatusUpdate={onStatusUpdate}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
