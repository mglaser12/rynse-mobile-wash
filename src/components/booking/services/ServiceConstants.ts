
export interface ServiceOption {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_SERVICES: ServiceOption[] = [
  {
    id: "exterior-wash",
    name: "Exterior Wash",
    description: "Complete exterior wash including wheels and windows"
  },
  {
    id: "interior-clean",
    name: "Interior Clean",
    description: "Vacuum, wipe down surfaces, and clean windows"
  },
  {
    id: "trailer-washout",
    name: "Trailer Washout",
    description: "Complete washout of trailer interior and exterior"
  }
];
