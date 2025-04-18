
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchVehiclesProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function SearchVehicles({
  searchQuery,
  onSearchChange,
  placeholder = "Search vehicles by make, model, year, license plate..."
}: SearchVehiclesProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldExpand = isFocused || isHovered || searchQuery.length > 0;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Search className={cn(
        "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-transform duration-200",
        shouldExpand && "scale-110"
      )} />
      <Input
        type="text"
        placeholder={shouldExpand ? placeholder : "Search"}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pl-9 transition-all duration-300 ease-in-out",
          shouldExpand ? "w-full" : "w-[120px]"
        )}
      />
    </div>
  );
}
