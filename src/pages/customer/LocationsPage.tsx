import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocations } from "@/contexts/LocationContext";
import { Location } from "@/models/types";
import { MapPin, Plus, Edit, Trash2, Star, List, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LocationDialog } from "@/components/location/LocationDialog";
import { ConfirmDeleteDialog } from "@/components/location/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SearchVehicles } from "@/components/vehicles/SearchVehicles";
import { RadarProvider } from "@/contexts/RadarContext";
import { useRadar } from "@/contexts/RadarContext";
import { RadarMap } from "@/components/location/RadarMap";
import { RadarConfig } from "@/components/location/RadarConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isMapInitialized, setIsMapInitialized] = useState(false);

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

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    toast.info(`Selected: ${location.name}`);
  };

  const handleMapInitialized = () => {
    setIsMapInitialized(true);
  };

  // Load Radar publishable key from localStorage on component mount
  useEffect(() => {
    // Check for saved key or use the hardcoded one
    const savedKey = localStorage.getItem("radar_publishable_key") || "prj_live_pk_560d2a5b5bfcbd600e4b0f31e0962eb1a25b27a5";
    if (savedKey) {
      // If we have a saved key, we'll initialize Radar in the RadarMap component
      setIsMapInitialized(true);
    }
  }, []);

  const filteredLocations = locations.filter((location) => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchTerms) ||
      location.address.toLowerCase().includes(searchTerms) ||
      location.city.toLowerCase().includes(searchTerms) ||
      location.state.toLowerCase().includes(searchTerms)
    );
  });

  // Check if locations have coordinates for map view
  const locationsWithCoordinates = filteredLocations.filter(
    (location) => location.latitude && location.longitude
  );
  
  const hasCoordinates = locationsWithCoordinates.length > 0;

  return (
    <RadarProvider>
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
            <div className="flex space-x-2">
              <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as "list" | "map")}
                className="hidden sm:block"
              >
                <TabsList>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map">
                    <Map className="h-4 w-4 mr-2" />
                    Map
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button onClick={handleAddLocation} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>
          
          {/* Mobile view mode toggle */}
          <div className="flex justify-center mt-2 sm:hidden">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "list" | "map")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>
        
        <div className="flex flex-col h-[calc(100vh-136px)] sm:h-[calc(100vh-64px)] overflow-hidden">
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
            ) : (
              <TabsContent value="list" className="mt-4">
                {filteredLocations.length === 0 ? (
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
                  <div className="grid grid-cols-1 gap-3">
                    {filteredLocations.map((location) => (
                      <Card 
                        key={location.id} 
                        className={`overflow-hidden ${selectedLocation?.id === location.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedLocation(location)}
                      >
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
                            <Button variant="outline" size="sm" onClick={(e) => {
                              e.stopPropagation();
                              handleEditLocation(location);
                            }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <div className="flex space-x-2">
                              {!location.isDefault && (
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefault(location);
                                  }}
                                >
                                  <Star className="h-4 w-4 mr-2" /> Set Default
                                </Button>
                              )}
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLocation(location);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
            
            <TabsContent value="map" className="mt-4">
              {!isMapInitialized ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                  <RadarConfig onInitialized={handleMapInitialized} />
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
              ) : !hasCoordinates ? (
                <div className="text-center my-12">
                  <p className="text-muted-foreground mb-4">
                    Your locations don't have coordinates information.
                    Edit your locations to add latitude and longitude.
                  </p>
                  <Button onClick={handleAddLocation} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location with Coordinates
                  </Button>
                </div>
              ) : (
                <div className="h-[calc(100vh-200px)]">
                  <RadarMap
                    locations={locationsWithCoordinates}
                    selectedLocation={selectedLocation}
                    onSelectLocation={handleSelectLocation}
                  />
                </div>
              )}
            </TabsContent>
          </div>

          {viewMode === "map" && selectedLocation && (
            <div className="p-4 bg-white border-t">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{selectedLocation.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedLocation.address}, {selectedLocation.city}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditLocation(selectedLocation)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  {!selectedLocation.isDefault && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleSetDefault(selectedLocation)}
                    >
                      <Star className="h-4 w-4 mr-1" /> Set Default
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
    </RadarProvider>
  );
}
