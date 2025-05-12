
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLocations } from "@/contexts/LocationContext";
import { Location } from "@/models/types";
import { MapPin, Plus, Edit, Trash2, Star, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { LocationDialog } from "@/components/location/LocationDialog";
import { ConfirmDeleteDialog } from "@/components/location/ConfirmDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SearchVehicles } from "@/components/vehicles/SearchVehicles";
import { LocationMap } from "@/components/location/LocationMap";
import { MapTokenInput } from "@/components/location/MapTokenInput";
import { useMap } from "@/contexts/MapContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LocationsPage() {
  const {
    locations,
    isLoading,
    setLocationAsDefault,
    deleteLocation
  } = useLocations();
  const { isMapAvailable } = useMap();
  const isMobile = useIsMobile();
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "map">(isMobile ? "list" : "map");

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

  const handleLocationSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
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

  // Desktop view uses a side-by-side layout
  const DesktopLayout = () => (
    <div className="grid grid-cols-5 gap-4 h-[calc(100vh-64px-92px)] overflow-hidden">
      <div className="col-span-2 overflow-hidden flex flex-col">
        <SearchVehicles 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
          placeholder="Search locations by name, address..." 
          className="mb-3"
        />
        
        <ScrollArea className="flex-1">
          <div className="pr-3 space-y-3">
            {filteredLocations.map((location) => (
              <LocationCard 
                key={location.id}
                location={location}
                isSelected={selectedLocation?.id === location.id}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
                onSetDefault={handleSetDefault}
                onClick={() => handleLocationSelect(location.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="col-span-3 h-full">
        {isMapAvailable ? (
          <LocationMap 
            locations={filteredLocations} 
            selectedLocationId={selectedLocation?.id}
            onLocationSelect={handleLocationSelect}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg border border-gray-200">
            <div className="text-center space-y-4 p-6">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium">Map View Not Available</p>
                <p className="text-sm text-muted-foreground mb-4">A Mapbox API key is required to display maps</p>
                <MapTokenInput />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile view uses tabs to switch between list and map
  const MobileLayout = () => (
    <Tabs 
      value={viewMode} 
      onValueChange={(value) => setViewMode(value as "list" | "map")}
      className="w-full"
    >
      <div className="sticky top-[64px] bg-white z-10 pb-2 border-b">
        <div className="flex items-center justify-between mb-2">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-1">
              <List className="h-4 w-4" /> List
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="h-4 w-4" /> Map
            </TabsTrigger>
          </TabsList>
          
          {viewMode === "map" && !isMapAvailable && (
            <MapTokenInput />
          )}
        </div>
        
        <SearchVehicles 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange} 
          placeholder="Search locations..." 
        />
      </div>
      
      <TabsContent value="list" className="mt-2">
        <div className="grid grid-cols-1 gap-3 pb-20">
          {filteredLocations.map((location) => (
            <LocationCard 
              key={location.id}
              location={location}
              isSelected={selectedLocation?.id === location.id}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
              onSetDefault={handleSetDefault}
              onClick={() => handleLocationSelect(location.id)}
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="map" className="mt-2">
        <div className="h-[calc(100vh-200px)]">
          {isMapAvailable ? (
            <LocationMap 
              locations={filteredLocations} 
              selectedLocationId={selectedLocation?.id}
              onLocationSelect={handleLocationSelect}
              className="h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg border border-gray-200">
              <div className="text-center space-y-4 p-6">
                <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">Map View Not Available</p>
                  <p className="text-sm text-muted-foreground mb-4">A Mapbox API key is required to display maps</p>
                  <MapTokenInput />
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );

  // Extract the location card into its own component
  const LocationCard = ({ 
    location, 
    isSelected,
    onClick,
    onEdit, 
    onDelete, 
    onSetDefault 
  }: { 
    location: Location;
    isSelected?: boolean;
    onClick: () => void;
    onEdit: (location: Location) => void;
    onDelete: (location: Location) => void;
    onSetDefault: (location: Location) => void;
  }) => (
    <Card 
      key={location.id} 
      className={`overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
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
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(location); }}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <div className="flex space-x-2">
            {!location.isDefault && (
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onSetDefault(location); }}>
                <Star className="h-4 w-4 mr-2" /> Set Default
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(location); }}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <header className="bg-white p-4 border-b sticky top-0 z-20">
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
          <div className="flex items-center gap-2">
            {!isMobile && (
              <MapTokenInput />
            )}
            <Button onClick={handleAddLocation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>
      </header>
      
      <div className="car-wash-container animate-fade-in p-4">
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
          <>
            {isMobile ? <MobileLayout /> : <DesktopLayout />}
          </>
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
