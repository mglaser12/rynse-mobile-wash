
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
          image: "https://media.istockphoto.com/id/472090019/photo/bulldozer.jpg?s=612x612&w=0&k=20&c=qGhecq79TvLW3gSJbVm_kLZ8Z-qDYDvKlXDY-dDlEIg="
        },
        {
          make: "Komatsu",
          model: "PC800 Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "Orange",
          licensePlate: "HD-5678",
          image: "https://media.istockphoto.com/id/184332081/photo/orange-excavator-on-a-construction-site.jpg?s=612x612&w=0&k=20&c=Bn8LQ2rBRFvYkrpqfoKt2CAIkE642JLIv9XUk_bK5AQ="
        },
        {
          make: "John Deere",
          model: "9R Tractor",
          year: "2023",
          type: "Heavy Duty",
          color: "Green",
          licensePlate: "HD-9012",
          image: "https://media.istockphoto.com/id/157384437/photo/tractor-at-sunset.jpg?s=612x612&w=0&k=20&c=HGlLW1iGCAOc7pOGirru_g-L7azkEEw6tanixzMr4S4="
        },
        {
          make: "Volvo",
          model: "EC750E Excavator",
          year: "2020",
          type: "Heavy Duty",
          color: "Gray",
          licensePlate: "HD-3456",
          image: "https://media.istockphoto.com/id/1329031407/photo/excavator-on-construction-site.jpg?s=612x612&w=0&k=20&c=SKpIyvYgZSbAh9rHMg-0SWoUlGpXdhX3OjZKkXRmWhA="
        },
        {
          make: "Liebherr",
          model: "R 9800 Mining Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "White",
          licensePlate: "HD-7890",
          image: "https://media.istockphoto.com/id/480493427/photo/excavator.jpg?s=612x612&w=0&k=20&c=-mugP46Av9gR2LgjWlFXeMdKLxYrQkquvXpsIRCKwlw="
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
