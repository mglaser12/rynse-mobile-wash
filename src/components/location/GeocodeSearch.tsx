
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMap } from '@/contexts/MapContext';
import { Loader2 } from 'lucide-react';

interface GeocodeSearchProps {
  onLocationFound: (result: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export function GeocodeSearch({ onLocationFound }: GeocodeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { mapboxToken } = useMap();

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapboxToken) return;
    
    setIsSearching(true);
    
    try {
      // Forward geocoding API request
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery
        )}.json?access_token=${mapboxToken}&country=US&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [longitude, latitude] = feature.center;
        
        // Parse address components
        let address = '';
        let city = '';
        let state = '';
        let zipCode = '';
        
        feature.context?.forEach((ctx: any) => {
          if (ctx.id.startsWith('postcode')) {
            zipCode = ctx.text;
          } else if (ctx.id.startsWith('place')) {
            city = ctx.text;
          } else if (ctx.id.startsWith('region')) {
            state = ctx.text;
          }
        });
        
        // Street address is usually the first part of the place name
        address = feature.place_name.split(',')[0];
        
        onLocationFound({
          address,
          city,
          state,
          zipCode,
          latitude,
          longitude
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter an address to search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchQuery.trim() || !mapboxToken}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>
    </div>
  );
}
