
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

  return (
    <div className="relative">
      <Search className={cn(
        "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground transition-transform duration-200",
        isFocused && "scale-110"
      )} />
      <Input
        type="text"
        placeholder={isFocused ? placeholder : "Search"}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pl-9 transition-all duration-200 ease-in-out",
          isFocused ? "w-full" : "w-[120px]",
          "hover:w-full focus:w-full"
        )}
      />
    </div>
  );
}
