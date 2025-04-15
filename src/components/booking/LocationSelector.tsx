
import React, { useState, useEffect } from "react";
import { WashLocation } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationSelectorProps {
  locations: WashLocation[];
  selectedLocation: WashLocation | null;
  onSelectLocation: (location: WashLocation) => void;
}

export function LocationSelector({ 
  locations = [], // Provide default empty array
  selectedLocation, 
  onSelectLocation 
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [safeLocations, setSafeLocations] = useState<WashLocation[]>([]);
  
  // Ensure locations is always an array with a useEffect to properly handle async data
  useEffect(() => {
    setSafeLocations(Array.isArray(locations) ? locations : []);
  }, [locations]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLocation ? selectedLocation.name : "Select a location"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search locations..." />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup className="overflow-hidden">
            <ScrollArea className="max-h-[300px]">
              {safeLocations.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.name}
                  onSelect={() => {
                    onSelectLocation(location);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLocation?.id === location.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <div>{location.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {location.address}, {location.city}, {location.state} {location.zipCode}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
