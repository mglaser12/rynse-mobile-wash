
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocations } from "@/contexts/LocationContext";
import { useVehicles } from "@/contexts/VehicleContext";
import { Location, Vehicle } from "@/models/types";
import { MapPin, PlusCircle, Edit, Trash2, Star, Home, Building, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LocationDialog } from "@/components/location/LocationDialog";
import { ConfirmDeleteDialog } from "@/components/location/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  getLocationForVehicle, 
  assignVehicleToLocation, 
  removeVehicleFromLocation 
} from "@/contexts/location/locationVehicleOperations";

export default function LocationsPage() {
  const { locations, isLoading, setLocationAsDefault, deleteLocation, refreshLocations } = useLocations();
  const { vehicles } = useVehicles();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [openVehicleDialog, setOpenVehicleDialog] = useState(false);
  const [locationVehicles, setLocationVehicles] = useState<{[locationId: string]: Vehicle[]}>({});
  const [isManagingVehicles, setIsManagingVehicles] = useState(false);
  const isMobile = useIsMobile();
  
  // Load vehicles for each location
  useEffect(() => {
    const loadLocationVehicles = async () => {
      const vehicleMap: {[locationId: string]: Vehicle[]} = {};
      
      for (const location of locations) {
        const vehicleList: Vehicle[] = [];
        
        for (const vehicle of vehicles) {
          const locationId = await getLocationForVehicle(vehicle.id);
          if (locationId === location.id) {
            vehicleList.push(vehicle);
          }
        }
        
        vehicleMap[location.id] = vehicleList;
      }
      
      setLocationVehicles(vehicleMap);
    };
    
    if (locations.length > 0 && vehicles.length > 0) {
      loadLocationVehicles();
    }
  }, [locations, vehicles]);
  
  const handleAddLocation = () => {
    setSelectedLocation(null);
    setOpenLocationDialog(true);
  };
  
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setOpenLocationDialog(true);
  };
  
  const handleDeleteLocation = (location: Location) => {
    setSelectedLocation(location);
    setOpenConfirmDelete(true);
  };
  
  const handleConfirmDelete = async () => {
    if (selectedLocation) {
      await deleteLocation(selectedLocation.id);
      setOpenConfirmDelete(false);
    }
  };
  
  const handleSetDefault = async (location: Location) => {
    await setLocationAsDefault(location.id);
  };
  
  const handleManageVehicles = (location: Location) => {
    setSelectedLocation(location);
    setOpenVehicleDialog(true);
    setIsManagingVehicles(true);
  };
  
  const handleAssignVehicle = async (vehicleId: string, locationId: string) => {
    await assignVehicleToLocation(vehicleId, locationId);
    await refreshLocations();
  };
  
  const handleRemoveVehicle = async (vehicleId: string, locationId: string) => {
    await removeVehicleFromLocation(vehicleId, locationId);
    await refreshLocations();
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Locations</h1>
          <Button onClick={handleAddLocation}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Location
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Building className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No locations yet</h2>
            <p className="text-muted-foreground mb-4">
              Add your first location to get started
            </p>
            <Button onClick={handleAddLocation}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add First Location
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((location) => (
                <Card key={location.id} className="relative">
                  {location.isDefault && (
                    <div className="absolute -top-2 -right-2">
                      <Badge variant="default" className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" /> Default
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {location.name}
                        </CardTitle>
                        <CardDescription>
                          {location.address}, {location.city}, {location.state} {location.zipCode}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {locationVehicles[location.id]?.length || 0} {(locationVehicles[location.id]?.length || 0) === 1 ? 'vehicle' : 'vehicles'} at this location
                      </span>
                    </div>
                    {locationVehicles[location.id]?.length > 0 && (
                      <div className="mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => handleManageVehicles(location)}
                        >
                          <Car className="h-4 w-4 mr-2" /> Manage Vehicles
                        </Button>
                      </div>
                    )}
                    {location.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {location.notes}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditLocation(location)}
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <div className="flex space-x-2">
                      {!location.isDefault && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleSetDefault(location)}
                        >
                          <Star className="h-4 w-4 mr-2" /> Set Default
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteLocation(location)}
                        disabled={locationVehicles[location.id]?.length > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <LocationDialog
        open={openLocationDialog}
        onOpenChange={setOpenLocationDialog}
        location={selectedLocation}
      />
      
      <ConfirmDeleteDialog
        open={openConfirmDelete}
        onOpenChange={setOpenConfirmDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Location"
        description={`Are you sure you want to delete "${selectedLocation?.name}"? This action cannot be undone, and any associated data will be lost.`}
        confirmText="Delete Location"
      />
      
      {/* Vehicle Management Dialog */}
      <Dialog open={openVehicleDialog} onOpenChange={setOpenVehicleDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Manage Vehicles at {selectedLocation?.name}</DialogTitle>
            <DialogDescription>
              Add or remove vehicles at this location
            </DialogDescription>
          </DialogHeader>
          
          {/* Vehicle list for this location */}
          <div className="space-y-4 mt-4">
            <h3 className="font-medium">Vehicles at this location</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {selectedLocation && locationVehicles[selectedLocation.id]?.length > 0 ? (
                locationVehicles[selectedLocation.id].map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 mr-2 text-primary" />
                      <div>
                        <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.year} {vehicle.color}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveVehicle(vehicle.id, selectedLocation.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No vehicles assigned to this location
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Add vehicles to this location</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {vehicles
                  .filter(vehicle => {
                    // Only show vehicles not already at this location
                    const locationVehicleIds = locationVehicles[selectedLocation?.id || '']?.map(v => v.id) || [];
                    return !locationVehicleIds.includes(vehicle.id);
                  })
                  .map(vehicle => (
                    <div key={vehicle.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <Car className="h-5 w-5 mr-2" />
                        <div>
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.year} {vehicle.color}</p>
                        </div>
                      </div>
                      {selectedLocation && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAssignVehicle(vehicle.id, selectedLocation.id)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  ))
                }
                {vehicles.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No vehicles available to add
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
