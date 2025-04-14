
// This is a mock OCR implementation
// In a real app, we'd integrate with a real OCR library like Tesseract.js or a cloud service

export type OCRResult = {
  success: boolean;
  data?: {
    make?: string;
    model?: string;
    year?: string;
    licensePlate?: string;
    vinNumber?: string;
    type?: string;
  };
  error?: string;
};

// Mock database of vehicle information
const vehicleDatabase = [
  {
    make: "Toyota",
    model: "Camry",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  },
  {
    make: "Toyota", 
    model: "RAV4", 
    type: "SUV",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  },
  {
    make: "Honda",
    model: "Civic",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  },
  {
    make: "Honda",
    model: "CR-V",
    type: "SUV",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  },
  {
    make: "Tesla",
    model: "Model 3",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  },
  {
    make: "Tesla",
    model: "Model Y",
    type: "SUV",
    years: ["2020", "2021", "2022", "2023"]
  },
  {
    make: "Ford",
    model: "F-150",
    type: "Truck",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  },
  {
    make: "Chevrolet",
    model: "Silverado",
    type: "Truck",
    years: ["2018", "2019", "2020", "2021", "2022", "2023"]
  }
];

// Mock function to process license plate image
export const processLicensePlateImage = async (imageFile: File): Promise<OCRResult> => {
  // In a real app, we would send the image to an OCR service
  // Here we'll just return a mock result after a delay
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a random license plate
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const numbers = '0123456789';
      let plate = '';
      
      // Format like: ABC1234
      for (let i = 0; i < 3; i++) {
        plate += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      for (let i = 0; i < 4; i++) {
        plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      
      resolve({
        success: true,
        data: {
          licensePlate: plate
        }
      });
    }, 1500);
  });
};

// Mock function to process VIN image
export const processVinImage = async (imageFile: File): Promise<OCRResult> => {
  // In a real app, we would send the image to an OCR service
  // Here we'll just return a mock result after a delay
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get random vehicle from database
      const randomVehicle = vehicleDatabase[Math.floor(Math.random() * vehicleDatabase.length)];
      const randomYear = randomVehicle.years[Math.floor(Math.random() * randomVehicle.years.length)];
      
      // Generate a random VIN
      const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
      let vin = '';
      for (let i = 0; i < 17; i++) {
        vin += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      resolve({
        success: true,
        data: {
          make: randomVehicle.make,
          model: randomVehicle.model,
          year: randomYear,
          type: randomVehicle.type,
          vinNumber: vin
        }
      });
    }, 2000);
  });
};

// Mock function to detect vehicle type from an image
export const detectVehicleFromImage = async (imageFile: File): Promise<OCRResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const vehicleTypes = ["Sedan", "SUV", "Truck", "Hatchback", "Convertible", "Coupe", "Van"];
      const randomType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      
      resolve({
        success: true,
        data: {
          type: randomType
        }
      });
    }, 1800);
  });
};
