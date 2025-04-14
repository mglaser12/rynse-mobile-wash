
import { Vehicle } from "../models/types";

export const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: "1",
    customerId: "1",
    type: "Work Van",
    make: "Ford",
    model: "Transit",
    year: "2022",
    licensePlate: "ABC-1234",
    color: "White",
    image: "https://images.unsplash.com/photo-1610307372171-5165eca0ab4c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    dateAdded: new Date("2023-01-15"),
  },
  {
    id: "2",
    customerId: "1",
    type: "Service Truck",
    make: "Chevrolet",
    model: "Silverado",
    year: "2021",
    licensePlate: "ABC-5678",
    color: "Blue",
    image: "https://images.unsplash.com/photo-1604156429959-21c7962cf0f4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    dateAdded: new Date("2023-05-20"),
  }
];
