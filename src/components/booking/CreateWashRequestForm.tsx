
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useWashRequests } from "@/contexts/WashContext";
import { useVehicles } from "@/contexts/VehicleContext";
import { VehicleList } from "../vehicles/VehicleList";
import { DateRangePicker } from "./DateRangePicker";
import { LocationSelector } from "./LocationSelector";
import { WashLocation } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Calendar, MapPin, Check } from "lucide-react";
import { AddVehicleForm } from "../vehicles/AddVehicleForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const { createWashRequest, locations } = useWashRequests();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("select");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<WashLocation | null>(null);
  const [notes, setNotes] = useState("");

  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const calculatePrice = () => {
    const basePrice = 39.99;
    return selectedVehicleIds.length * basePrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a wash request");
      return;
    }

    if (selectedVehicleIds.length === 0) {
      toast.error("Please select at least one vehicle");
      return;
    }

    if (!startDate) {
      toast.error("Please select a date for your wash");
      return;
    }

    if (!selectedLocation) {
      toast.error("Please select a location");
      return;
    }

    setIsLoading(true);

    try {
      await createWashRequest({
        customerId: user.id,
        vehicles: selectedVehicleIds,
        location: selectedLocation,
        preferredDates: {
          start: startDate,
          end: endDate,
        },
        price: calculatePrice(),
        notes: notes,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating wash request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash</h3>
        <p className="text-sm text-muted-foreground">
          Select your vehicles and preferred details for your mobile wash.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Vehicles</Label>
              <span className="text-sm text-muted-foreground">
                {selectedVehicleIds.length} selected
              </span>
            </div>

            {vehicles.length === 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  You don't have any vehicles yet. Add one to continue.
                </p>
                <AddVehicleForm onCancel={onCancel} />
              </div>
            ) : (
              <Tabs defaultValue="select" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">Select Vehicle</TabsTrigger>
                  <TabsTrigger value="add">Add New Vehicle</TabsTrigger>
                </TabsList>
                <TabsContent value="select" className="py-4">
                  <VehicleList 
                    onSelectVehicle={handleVehicleSelection}
                    onAddVehicle={() => setActiveTab("add")}
                    selectedVehicleIds={selectedVehicleIds}
                    selectionMode={true}
                  />
                </TabsContent>
                <TabsContent value="add">
                  <AddVehicleForm 
                    onCancel={() => setActiveTab("select")} 
                    onSuccess={() => {
                      setActiveTab("select");
                      toast.success("Vehicle added! Now you can select it for your wash.");
                    }}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>

          <Separator />
          
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Preferred Date
            </Label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              allowRange={true}
            />
            <p className="text-xs text-muted-foreground">
              Select a single date or a range of dates for your wash.
            </p>
          </div>
          
          {/* Location Selection */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Wash Location
            </Label>
            <LocationSelector
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />
          </div>
          
          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Price Summary */}
          {selectedVehicleIds.length > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center justify-between font-medium">
                <span>Price Estimate:</span>
                <span className="text-lg">${calculatePrice().toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Price based on {selectedVehicleIds.length} vehicle{selectedVehicleIds.length !== 1 && "s"} at $39.99 each.
              </p>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isLoading || 
                selectedVehicleIds.length === 0 || 
                !startDate || 
                !selectedLocation
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Request Wash
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
