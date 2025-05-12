
import React, { useEffect, useRef, useState } from "react";
import { WashRequest } from "@/models/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicianJobMapProps {
  jobLocations: Pick<WashRequest, "id" | "location" | "preferredDates">[];
  onSelectJob?: (jobId: string) => void;
  selectedJobId?: string;
}

export const TechnicianJobMap = ({ 
  jobLocations, 
  onSelectJob,
  selectedJobId 
}: TechnicianJobMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Check if user has granted location access
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setMapError("Unable to retrieve your location. Please enable location services.");
        }
      );
    } else {
      setMapError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Initialize map when container is available
  useEffect(() => {
    // This is a placeholder for map implementation
    // In a real implementation, you would initialize a map library here
    // such as Google Maps, Mapbox, or Leaflet
    
    if (mapContainerRef.current && jobLocations.length > 0) {
      console.log("Would initialize map here with job locations:", jobLocations);
      
      // For demonstration purposes only:
      setMap({ initialized: true });
      
      // Clear any existing markers on unmount
      return () => {
        if (markers.length > 0) {
          console.log("Would clear markers here");
          setMarkers([]);
        }
      };
    }
  }, [mapContainerRef, jobLocations]);

  // If there are no job locations, show a placeholder
  if (jobLocations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Job Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          No scheduled jobs with addresses found
        </CardContent>
      </Card>
    );
  }

  // Render a list of job locations alongside a map container
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Job Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapError ? (
          <div className="text-center p-4 text-red-500">{mapError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-100 rounded-md" ref={mapContainerRef}>
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Map would be displayed here
                {/* In production, a real map would be shown here */}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              <h3 className="text-sm font-medium mb-2">Locations</h3>
              <ul className="space-y-2">
                {jobLocations.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <li 
                      key={job.id} 
                      className={`p-2 rounded-md text-sm ${isSelected ? 'bg-primary/10 border border-primary/30' : 'bg-background hover:bg-accent'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{job.location?.name}</p>
                          {job.location?.address && (
                            <p className="text-xs text-muted-foreground">{job.location.address}</p>
                          )}
                          <p className="text-xs mt-1">
                            {job.preferredDates?.start && (
                              new Date(job.preferredDates.start).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              // Open directions in maps app
                              const address = encodeURIComponent(job.location?.address || '');
                              if (address) {
                                window.open(`https://maps.google.com/maps?daddr=${address}`, '_blank');
                              }
                            }}
                            title="Get directions"
                          >
                            <Navigation className="h-4 w-4 text-primary" />
                          </Button>
                          
                          {onSelectJob && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelectJob(job.id)}
                              className="text-xs h-7"
                            >
                              Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
