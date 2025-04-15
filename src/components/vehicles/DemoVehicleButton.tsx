
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/contexts/VehicleContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DemoVehicleButtonProps {
  isVisible: boolean;
}

export function DemoVehicleButton({ isVisible }: DemoVehicleButtonProps) {
  const [isAddingDemoVehicles, setIsAddingDemoVehicles] = useState(false);
  const { user } = useAuth();
  const { addVehicle } = useVehicles();

  const addDemoVehicles = async () => {
    if (!user) {
      toast.error("You must be logged in to add vehicles");
      return;
    }

    setIsAddingDemoVehicles(true);
    
    try {
      const heavyDutyVehicles = [
        {
          make: "Caterpillar",
          model: "D9 Dozer",
          year: "2022",
          type: "Heavy Duty",
          color: "Yellow",
          licensePlate: "HD-1234",
          image: "https://images.unsplash.com/photo-1597245623587-b4d0afe3d1bf?q=80&w=1000&auto=format&fit=crop"
        },
        {
          make: "Komatsu",
          model: "PC800 Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "Orange",
          licensePlate: "HD-5678",
          image: "https://images.unsplash.com/photo-1579951417567-9f20adfa2ce1?q=80&w=1000&auto=format&fit=crop"
        },
        {
          make: "John Deere",
          model: "9R Tractor",
          year: "2023",
          type: "Heavy Duty",
          color: "Green",
          licensePlate: "HD-9012",
          image: "https://images.unsplash.com/photo-1579752341511-bf17a7c335cf?q=80&w=1000&auto=format&fit=crop"
        },
        {
          make: "Volvo",
          model: "EC750E Excavator",
          year: "2020",
          type: "Heavy Duty",
          color: "Gray",
          licensePlate: "HD-3456",
          image: "https://images.unsplash.com/photo-1504289596546-6d1ac6b7bac8?q=80&w=1000&auto=format&fit=crop"
        },
        {
          make: "Liebherr",
          model: "R 9800 Mining Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "White",
          licensePlate: "HD-7890",
          image: "https://images.unsplash.com/photo-1626155399614-acdfbb43aa6e?q=80&w=1000&auto=format&fit=crop"
        }
      ];

      for (const vehicle of heavyDutyVehicles) {
        await addVehicle({
          ...vehicle,
          customerId: user.id
        });
      }

      toast.success("Added 5 demo heavy duty vehicles!");
    } catch (error) {
      console.error("Error adding demo vehicles:", error);
      toast.error("Failed to add demo vehicles");
    } finally {
      setIsAddingDemoVehicles(false);
    }
  };

  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <Button 
        onClick={addDemoVehicles}
        variant="outline"
        className="w-full"
        disabled={isAddingDemoVehicles}
      >
        {isAddingDemoVehicles ? "Adding Demo Vehicles..." : "Add 5 Demo Heavy Duty Vehicles"}
      </Button>
    </div>
  );
}
