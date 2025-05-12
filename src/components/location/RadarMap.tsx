
import React, { useEffect, useRef, useState } from "react";
import { useRadar } from "@/contexts/RadarContext";
import { Location } from "@/models/types";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RadarMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  className?: string;
}

export function RadarMap({
  locations,
  selectedLocation,
  onSelectLocation,
  className = "",
}: RadarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isInitialized } = useRadar();
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!isInitialized || !mapRef.current || map) return;

    // Default map center (US center)
    const defaultCenter = { lat: 37.0902, lng: -95.7129 };
    
    // Create map
    try {
      const mapInstance = window.radar.ui.map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: 3
      });
      
      setMap(mapInstance);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to load map");
    }
  }, [isInitialized, map]);

  // Add location markers
  useEffect(() => {
    if (!map || !locations.length) return;

    // Clear existing markers
    const markers = map.getMarkers();
    if (markers) {
      markers.forEach((marker: any) => marker.remove());
    }

    // Add new markers
    locations.forEach(location => {
      if (!location.latitude || !location.longitude) return;
      
      const isSelected = selectedLocation?.id === location.id;
      
      const markerElement = document.createElement('div');
      markerElement.className = `map-marker ${isSelected ? 'selected' : ''}`;
      markerElement.innerHTML = `
        <div class="w-8 h-8 flex items-center justify-center bg-${isSelected ? 'primary' : 'background'} rounded-full shadow-md border-2 border-${isSelected ? 'background' : 'muted'} cursor-pointer transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? 'white' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-background px-2 py-1 rounded shadow text-xs whitespace-nowrap ${!isSelected ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity">
          ${location.name}
        </div>
      `;
      
      const marker = window.radar.ui.marker({
        element: markerElement,
        draggable: false
      }).setLngLat([location.longitude, location.latitude])
        .addTo(map);
      
      // Add click event
      marker.getElement().addEventListener('click', () => {
        onSelectLocation(location);
      });
    });

    // Fit bounds to show all markers if we have multiple locations
    if (locations.length > 1) {
      const bounds = new window.radar.ui.LngLatBounds();
      locations.forEach(location => {
        if (location.latitude && location.longitude) {
          bounds.extend([location.longitude, location.latitude]);
        }
      });
      map.fitBounds(bounds, { padding: 50 });
    } 
    // Zoom to selected location if we have only one
    else if (locations.length === 1 && locations[0].latitude && locations[0].longitude) {
      map.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        zoom: 14
      });
    }
  }, [map, locations, selectedLocation, onSelectLocation]);

  // Focus on selected location
  useEffect(() => {
    if (!map || !selectedLocation || !selectedLocation.latitude || !selectedLocation.longitude) return;
    
    map.flyTo({
      center: [selectedLocation.longitude, selectedLocation.latitude],
      zoom: 15,
      essential: true
    });
  }, [map, selectedLocation]);

  // Get user location
  const handleGetUserLocation = () => {
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserLocation({ lat, lng });
        
        if (map) {
          map.flyTo({
            center: [lng, lat],
            zoom: 14
          });
          
          // Add user marker
          const userMarkerElement = document.createElement('div');
          userMarkerElement.className = "user-marker";
          userMarkerElement.innerHTML = `
            <div class="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full shadow-md border-2 border-white pulse-animation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
          `;
          
          window.radar.ui.marker({
            element: userMarkerElement
          }).setLngLat([lng, lat])
            .addTo(map);
        }
        
        toast.success("Current location found");
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Couldn't access your location");
        setIsLoadingLocation(false);
      }
    );
  };

  return (
    <div className={`relative w-full h-full rounded-md overflow-hidden border ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="secondary" 
          size="sm" 
          className="shadow-md"
          onClick={handleGetUserLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>Finding location...</>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              My Location
            </>
          )}
        </Button>
      </div>
      
      <style>
        {`
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
        `}
      </style>
    </div>
  );
}
