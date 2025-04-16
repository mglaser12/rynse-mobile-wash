
import { createWorker } from 'tesseract.js';
import { toast } from "sonner";

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

// Vehicle database for lookup after OCR text extraction
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

// Initialize Tesseract worker with a cache
let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

// Helper function to initialize the OCR worker
async function getWorker() {
  if (!worker) {
    worker = await createWorker('eng');
    console.log('OCR worker initialized');
  }
  return worker;
}

// Function to perform OCR on an image
async function performOCR(imageFile: File): Promise<string> {
  try {
    const ocrWorker = await getWorker();
    
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Recognize text in the image
    const { data } = await ocrWorker.recognize(imageUrl);
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    return data.text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image');
  }
}

// Extract a license plate from OCR text
function extractLicensePlate(text: string): string | null {
  // Simple pattern matching for license plates (adapt as needed for your region)
  // This looks for patterns like: ABC123, ABC-123, ABC 123, etc.
  const patterns = [
    /[A-Z]{3}[-\s]?[0-9]{3,4}/i,  // Format: ABC123 or ABC-123 or ABC 123
    /[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{2}/i,  // Format: AB12CD
    /[0-9]{1,3}[-\s]?[A-Z]{3}/i,  // Format: 123ABC
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      // Remove any spaces or hyphens
      return match[0].replace(/[\s-]/g, '').toUpperCase();
    }
  }
  
  return null;
}

// Extract a VIN number from OCR text
function extractVIN(text: string): string | null {
  // VIN numbers are 17 characters and don't contain I, O, or Q
  // This regex looks for a 17-character string with letters and numbers
  const pattern = /[A-HJ-NPR-Z0-9]{17}/i;
  const match = text.match(pattern);
  
  if (match && match[0]) {
    return match[0].toUpperCase();
  }
  
  return null;
}

// Process license plate image
export const processLicensePlateImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    const ocrText = await performOCR(imageFile);
    console.log('License plate OCR raw text:', ocrText);
    
    const licensePlate = extractLicensePlate(ocrText);
    
    if (licensePlate) {
      return {
        success: true,
        data: {
          licensePlate
        }
      };
    } else {
      return {
        success: false,
        error: "Could not detect a valid license plate number"
      };
    }
  } catch (error) {
    console.error('License plate processing error:', error);
    return {
      success: false,
      error: "Error processing license plate image"
    };
  }
};

// Find potential vehicle make and model in text
function findVehicleInfo(text: string): { make?: string; model?: string; year?: string; type?: string } {
  const normalizedText = text.toLowerCase();
  const result: { make?: string; model?: string; year?: string; type?: string } = {};
  
  // Look for vehicle make and model
  for (const vehicle of vehicleDatabase) {
    if (normalizedText.includes(vehicle.make.toLowerCase())) {
      result.make = vehicle.make;
      
      // If we found the make, check for matching model
      if (normalizedText.includes(vehicle.model.toLowerCase())) {
        result.model = vehicle.model;
        result.type = vehicle.type;
        break;
      }
    }
  }
  
  // Look for year (4 digit number between 1900 and current year + 1)
  const currentYear = new Date().getFullYear();
  const yearPattern = /\b(19\d{2}|20\d{2})\b/g;
  const years = [...normalizedText.matchAll(yearPattern)].map(match => match[0]);
  
  if (years.length > 0) {
    // Filter to only include years between 1900 and current year + 1
    const validYears = years.filter(year => {
      const yearNum = parseInt(year);
      return yearNum >= 1900 && yearNum <= currentYear + 1;
    });
    
    if (validYears.length > 0) {
      // Use the most recent year
      result.year = validYears.sort().pop();
    }
  }
  
  return result;
}

// Process VIN image
export const processVinImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    const ocrText = await performOCR(imageFile);
    console.log('VIN OCR raw text:', ocrText);
    
    const vinNumber = extractVIN(ocrText);
    
    // Try to extract vehicle information from the OCR text
    const vehicleInfo = findVehicleInfo(ocrText);
    
    if (vinNumber || Object.keys(vehicleInfo).length > 0) {
      return {
        success: true,
        data: {
          vinNumber,
          ...vehicleInfo
        }
      };
    } else {
      return {
        success: false,
        error: "Could not detect a valid VIN number or vehicle information"
      };
    }
  } catch (error) {
    console.error('VIN processing error:', error);
    return {
      success: false,
      error: "Error processing VIN image"
    };
  }
};

// Detect vehicle type from an image
export const detectVehicleFromImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    const ocrText = await performOCR(imageFile);
    console.log('Vehicle OCR raw text:', ocrText);
    
    // Look for vehicle type keywords in the text
    const vehicleTypes = ["Sedan", "SUV", "Truck", "Hatchback", "Convertible", "Coupe", "Van"];
    const normalizedText = ocrText.toLowerCase();
    
    let detectedType = null;
    
    for (const type of vehicleTypes) {
      if (normalizedText.includes(type.toLowerCase())) {
        detectedType = type;
        break;
      }
    }
    
    // Try to extract vehicle information from the OCR text
    const vehicleInfo = findVehicleInfo(ocrText);
    
    if (detectedType || vehicleInfo.type) {
      return {
        success: true,
        data: {
          type: detectedType || vehicleInfo.type,
          ...vehicleInfo
        }
      };
    } else {
      return {
        success: false,
        error: "Could not detect a vehicle type"
      };
    }
  } catch (error) {
    console.error('Vehicle detection error:', error);
    return {
      success: false,
      error: "Error processing vehicle image"
    };
  }
};

// Search for a vehicle by license plate image
export const searchVehicleByLicensePlate = async (imageFile: File): Promise<string | null> => {
  try {
    const result = await processLicensePlateImage(imageFile);
    if (result.success && result.data?.licensePlate) {
      return result.data.licensePlate;
    }
    return null;
  } catch (error) {
    toast.error("Failed to process license plate image");
    return null;
  }
};

// Clean up the worker when no longer needed
export const cleanupOCRWorker = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
    console.log('OCR worker terminated');
  }
};
