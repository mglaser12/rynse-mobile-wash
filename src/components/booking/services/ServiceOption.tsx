
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export interface ServiceOptionProps {
  id: string;
  name: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  vehicleId: string;
}

export function ServiceOption({
  id,
  name,
  description,
  checked,
  onChange,
  vehicleId
}: ServiceOptionProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={`${vehicleId}-${id}`}
        checked={checked}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor={`${vehicleId}-${id}`}
          className="cursor-pointer font-medium"
        >
          {name}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
