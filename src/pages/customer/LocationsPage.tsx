
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocations } from "@/contexts/LocationContext";
import { Location } from "@/models/types";
import { MapPin, PlusCircle, Edit, Trash2, Star, Home, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LocationDialog } from "@/components/location/LocationDialog";
import { ConfirmDeleteDialog } from "@/components/location/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LocationsPage() {
  const { locations, isLoading, setDefaultLocation, deleteLocation } = useLocations();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
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
    await setDefaultLocation(location.id);
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
                      <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {location.vehicleCount} {location.vehicleCount === 1 ? 'vehicle' : 'vehicles'} at this location
                      </span>
                    </div>
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
    </AppLayout>
  );
}
