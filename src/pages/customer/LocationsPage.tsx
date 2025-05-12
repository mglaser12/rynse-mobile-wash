
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocations } from "@/contexts/LocationContext";
import { Location } from "@/models/types";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LocationDialog } from "@/components/location/LocationDialog";
import { ConfirmDeleteDialog } from "@/components/location/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SearchVehicles } from "@/components/vehicles/SearchVehicles";

export default function LocationsPage() {
  const {
    locations,
    isLoading,
    setLocationAsDefault,
    deleteLocation
  } = useLocations();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredLocations = locations.filter((location) => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchTerms) ||
      location.address.toLowerCase().includes(searchTerms) ||
      location.city.toLowerCase().includes(searchTerms) ||
      location.state.toLowerCase().includes(searchTerms)
    );
  });

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/3d6deccc-d4a2-4bfb-9acc-18c6e46f5b73.png" 
              alt="Rynse Logo" 
              className="h-8 mr-3" 
            />
            <div>
              <h1 className="text-xl font-bold">Locations</h1>
              <p className="text-sm text-muted-foreground">Manage your service locations</p>
            </div>
          </div>
          <Button onClick={handleAddLocation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </header>
      
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        <div className="car-wash-container animate-fade-in p-4 flex-1 overflow-y-auto">
          <SearchVehicles 
            searchQuery={searchQuery} 
            onSearchChange={handleSearchChange} 
            placeholder="Search locations by name, address..." 
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center my-12">
              <p className="text-muted-foreground mb-4">No locations found</p>
              <button
                onClick={handleAddLocation}
                className="text-primary hover:underline"
              >
                Add your first location
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mt-4">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          <h3 className="font-semibold">{location.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {location.address}, {location.city}, {location.state} {location.zipCode}
                        </p>
                      </div>
                      {location.isDefault && (
                        <Badge variant="default" className="bg-yellow-500 flex items-center py-1 shadow-sm px-[7px]">
                          <Star className="h-3 w-3 mr-1" /> Default
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" size="sm" onClick={() => handleEditLocation(location)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <div className="flex space-x-2">
                        {!location.isDefault && (
                          <Button variant="secondary" size="sm" onClick={() => handleSetDefault(location)}>
                            <Star className="h-4 w-4 mr-2" /> Set Default
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteLocation(location)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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

