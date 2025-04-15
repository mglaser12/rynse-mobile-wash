
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
    image: "https://www.ford.com/is/image/content/dam/vdm_ford/live/en_us/ford/nameplate/transitvanwagon/2023/collections/dm/22_FRD_TRN_55429_C7447012_Transit_Van_34FrontPassengerSide_16x9.png?croppathe=1_3:2&wid=900",
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
    image: "https://www.chevrolet.com/content/dam/chevrolet/na/us/english/index/vehicles/2021/trucks/silverado/01-images/colorizer/2021-silverado1500-colorizer-northsky-blue.jpg?imwidth=960",
    dateAdded: new Date("2023-05-20"),
  }
];
