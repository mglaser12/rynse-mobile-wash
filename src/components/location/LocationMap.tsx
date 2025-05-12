import React, { useEffect, useRef, useState } from 'react';
import { useMap } from '@/contexts/MapContext';
import { MapPin, Loader2 } from 'lucide-react';
import { Location } from '@/models/types';

// Define types for mapbox-gl to avoid direct import issues
type MapboxMap = any;
type MapboxMarker = any;
type MapboxPopup = any;
type MapboxLngLatBounds = any;
type MapboxNavigationControl = any;
type MapboxFullscreenControl = any;
type MapboxGeolocateControl = any;

// Function to load Mapbox from CDN
const loadMapboxFromCDN = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Check if mapboxgl is already loaded
      if (window.mapboxgl) {
        resolve();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Mapbox from CDN'));
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};

interface LocationMapProps {
  locations: Location[];
  selectedLocationId?: string;
  onLocationSelect?: (locationId: string) => void;
  className?: string;
  height?: string;
}

export const LocationMap = ({ 
  locations, 
  selectedLocationId,
  onLocationSelect,
  className = "w-full h-96", 
  height = "h-96"
}: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markersRef = useRef<{ [key: string]: MapboxMarker }>({});
  const { mapboxToken } = useMap();
  const [loading, setLoading] = useState(true);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Attempt to load mapbox-gl - first via import, then via CDN
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // First try: attempt to load via module import
        const mapboxModule = await import('mapbox-gl').catch(() => null);
        if (mapboxModule?.default) {
          await import('mapbox-gl/dist/mapbox-gl.css').catch(() => {
            // CSS import failed, but we can still use the CDN CSS
          });
          setMapboxgl(mapboxModule.default);
          setMapboxLoaded(true);
          return;
        }
        
        // Second try: fall back to CDN
        await loadMapboxFromCDN();
        setMapboxgl(window.mapboxgl);
        setMapboxLoaded(true);
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setError('Failed to load Mapbox. Please check your internet connection and try again.');
        setLoading(false);
      }
    };
    
    loadMapbox();
    
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Initialize map when component mounts and mapbox is loaded
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !mapboxgl || !mapboxLoaded) return;
    
    // Use the provided token
    const token = mapboxToken === "MAPBOX_TOKEN" 
      ? "pk.eyJ1IjoibWF0dHJ5bnNlIiwiYSI6ImNtYWxsM2FoYjBhM2oyam9icHkzeTZ1eG8ifQ.p7JoAIEy_fOV7AsoMClKeA" 
      : mapboxToken;
    
    try {
      // Set access token for Mapbox
      mapboxgl.accessToken = token;
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-95.7129, 37.0902], // Default to US center
        zoom: 3
      });

      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      newMap.addControl(new mapboxgl.FullscreenControl());

      // Add geolocation control
      newMap.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        })
      );

      // Handle map load
      newMap.on('load', () => {
        setLoading(false);
      });

      map.current = newMap;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Error initializing map. Please try again later.');
      setLoading(false);
    }
  }, [mapboxToken, mapboxgl, mapboxLoaded]);

  // Add markers when locations change or map is initialized
  useEffect(() => {
    if (!map.current || !mapboxToken || !mapboxgl) return;
    
    try {
      // Clear existing markers
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
      
      // Filter locations with valid coordinates
      const validLocations = locations.filter(
        loc => loc.latitude && loc.longitude
      );
      
      if (validLocations.length === 0) return;
      
      // Create bounds to fit all markers
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add markers for each location
      validLocations.forEach(location => {
        if (!location.latitude || !location.longitude) return;
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.innerHTML = `<div class="${
          location.id === selectedLocationId 
            ? 'bg-primary text-white' 
            : 'bg-white text-primary'
        } p-1 rounded-full shadow-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>`;
        
        // Create a popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<strong>${location.name}</strong><br>${location.address}, ${location.city}, ${location.state}`
        );
        
        // Create and add the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(map.current);
        
        // Add click handler if provided
        if (onLocationSelect) {
          el.addEventListener('click', () => {
            onLocationSelect(location.id);
          });
        }
        
        // Store marker reference for later removal
        markersRef.current[location.id] = marker;
        
        // Extend bounds to include this location
        bounds.extend([location.longitude, location.latitude]);
      });
      
      // Fit map to bounds with padding
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15
        });
      }
    } catch (err) {
      console.error('Error adding markers:', err);
    }
  }, [locations, mapboxgl, mapboxToken, selectedLocationId, onLocationSelect]);

  // Update marker styles when selectedLocationId changes
  useEffect(() => {
    if (!map.current || !mapboxgl) return;
    
    try {
      // Update marker styles based on selection
      Object.keys(markersRef.current).forEach(locationId => {
        const markerElement = markersRef.current[locationId].getElement();
        const iconElement = markerElement.querySelector('div');
        if (iconElement) {
          if (locationId === selectedLocationId) {
            iconElement.className = 'bg-primary text-white p-1 rounded-full shadow-md cursor-pointer';
          } else {
            iconElement.className = 'bg-white text-primary p-1 rounded-full shadow-md cursor-pointer';
          }
        }
      });
    } catch (err) {
      console.error('Error updating marker styles:', err);
    }
  }, [selectedLocationId, mapboxgl]);

  if (!mapboxToken) {
    return (
      <div className={`flex items-center justify-center ${className} ${height} bg-gray-100 rounded-lg border border-gray-200`}>
        <div className="text-center space-y-2 p-4">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Mapbox API key is required to display maps</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className} ${height} bg-gray-100 rounded-lg border border-gray-200`}>
        <div className="text-center space-y-2 p-4">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className} ${height} border border-gray-200`}>
      <div ref={mapContainer} className="absolute inset-0" />
      {(loading || !mapboxLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
