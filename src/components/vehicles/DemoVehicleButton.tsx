
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
          image: "https://s7d2.scene7.com/is/image/Caterpillar/C811938?$cc-g$"
        },
        {
          make: "Komatsu",
          model: "PC800 Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "Orange",
          licensePlate: "HD-5678",
          image: "https://d3is49fvltuaded.cloudfront.net/appliedmachinery/komatsu-pc490lc-11-excavator-003--25448.jpg"
        },
        {
          make: "John Deere",
          model: "9R Tractor",
          year: "2023",
          type: "Heavy Duty",
          color: "Green",
          licensePlate: "HD-9012",
          image: "https://rgtractor.com/wp-content/uploads/2021/12/johndeere-9r.jpg"
        },
        {
          make: "Volvo",
          model: "EC750E Excavator",
          year: "2020",
          type: "Heavy Duty",
          color: "Gray",
          licensePlate: "HD-3456",
          image: "https://www.volvoce.com/-/media/volvoce/global/products/excavators/crawler-excavators/segments/overview/volvo-crawler-excavator-ec750e-t2-walkaround-1280x860.jpg?v=MJHVJw&h=860&w=1280"
        },
        {
          make: "Liebherr",
          model: "R 9800 Mining Excavator",
          year: "2021",
          type: "Heavy Duty",
          color: "White",
          licensePlate: "HD-7890",
          image: "https://www.liebherr.com/shared/media/mining/products/mobile-equipment/excavators/product-category/mining-excavators.jpg"
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
