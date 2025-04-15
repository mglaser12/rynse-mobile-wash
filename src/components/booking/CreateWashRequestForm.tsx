import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useWashRequests } from "@/contexts/WashContext";
import { useVehicles } from "@/contexts/VehicleContext";
import { DateRangePicker } from "./DateRangePicker";
import { LocationSelector } from "./LocationSelector";
import { WashLocation } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Calendar, MapPin } from "lucide-react";
import { AddVehicleForm } from "../vehicles/AddVehicleForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VehicleSelectionTab } from "./VehicleSelectionTab";
import { PriceSummary } from "./PriceSummary";
import { FormActions } from "./FormActions";

interface CreateWashRequestFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export function CreateWashRequestForm({ onSuccess, onCancel }: CreateWashRequestFormProps) {
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const { createWashRequest, locations = [] } = useWashRequests();
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
        price: selectedVehicleIds.length * 39.99,
        notes: notes,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating wash request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedVehicleIds.length > 0 && 
                      startDate !== undefined && 
                      selectedLocation !== null;

  return (
    <div className="space-y-6 overflow-hidden flex flex-col h-full">
      <div>
        <h3 className="text-lg font-medium">Request a Mobile Wash</h3>
        <p className="text-sm text-muted-foreground">
          Select your vehicles and preferred details for your mobile wash.
        </p>
      </div>
      
      <ScrollArea className="flex-1 pr-4 -mr-4">
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
                    <VehicleSelectionTab 
                      vehicles={vehicles}
                      selectedVehicleIds={selectedVehicleIds}
                      onSelectVehicle={handleVehicleSelection}
                      onAddVehicle={() => setActiveTab("add")}
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
                locations={locations || []}
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
            <PriceSummary vehicleCount={selectedVehicleIds.length} />
            
            {/* Form Actions */}
            <FormActions 
              isLoading={isLoading} 
              isValid={isFormValid}
              onCancel={onCancel}
            />
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
