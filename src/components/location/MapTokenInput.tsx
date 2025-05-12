
import React, { useState } from 'react';
import { useMap } from '@/contexts/MapContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MapPin } from 'lucide-react';

interface MapTokenInputProps {
  className?: string;
}

export function MapTokenInput({ className }: MapTokenInputProps) {
  const { mapboxToken, setMapboxToken, isMapAvailable } = useMap();
  const [token, setToken] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveToken = () => {
    if (token.trim()) {
      setMapboxToken(token.trim());
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <div className={className}>
        {isMapAvailable ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsDialogOpen(true)}
          >
            <MapPin className="h-4 w-4 mr-2" /> Update Map API Key
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsDialogOpen(true)}
          >
            <MapPin className="h-4 w-4 mr-2" /> Set Up Maps
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mapbox API Key</DialogTitle>
            <DialogDescription>
              Enter your Mapbox API key to enable maps functionality. You can get a free API key from{' '}
              <a 
                href="https://account.mapbox.com/auth/signup/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary underline"
              >
                Mapbox.com
              </a>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input 
              value={token} 
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter Mapbox API key"
              type="password"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveToken} disabled={!token.trim()}>Save API Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
