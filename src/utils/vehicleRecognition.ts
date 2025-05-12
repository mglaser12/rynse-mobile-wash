import { pipeline, env } from '@huggingface/transformers';
import { toast } from "sonner";
import { OCRResult } from "./ocrUtils";

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

// Initialize models - these will be loaded on demand
let visionModelInitialized = false;
let textModelInitialized = false;

// Model status tracking
type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
const modelStatus: {
  vision: ModelStatus;
  text: ModelStatus;
} = {
  vision: 'idle',
  text: 'idle'
};

// Initialize the vision model
async function initializeVisionModel() {
  if (visionModelInitialized) return true;
  
  try {
    modelStatus.vision = 'loading';
    
    // This is a lightweight model that can classify vehicle types
    await pipeline('image-classification', 'Xenova/resnet-18-vehicle-type');
    
    visionModelInitialized = true;
    modelStatus.vision = 'ready';
    console.log('Vehicle vision model initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize vision model:', error);
    modelStatus.vision = 'error';
    return false;
  }
}

// Initialize the text recognition model
async function initializeTextModel() {
  if (textModelInitialized) return true;
  
  try {
    modelStatus.text = 'loading';
    
    // Use Tesseract.js for text recognition as it's already implemented
    textModelInitialized = true;
    modelStatus.text = 'ready';
    console.log('Text recognition model initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize text model:', error);
    modelStatus.text = 'error';
    return false;
  }
}

// Vehicle database with extended information
const vehicleDatabase = [
  {
    make: "Toyota",
    model: "Camry",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "TYT-CM"
  },
  {
    make: "Toyota", 
    model: "RAV4", 
    type: "SUV",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "TYT-RV"
  },
  {
    make: "Honda",
    model: "Civic",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "HND-CV"
  },
  {
    make: "Honda",
    model: "CR-V",
    type: "SUV",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "HND-CR"
  },
  {
    make: "Tesla",
    model: "Model 3",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "TSL-M3"
  },
  {
    make: "Tesla",
    model: "Model Y",
    type: "SUV",
    years: ["2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "TSL-MY"
  },
  {
    make: "Ford",
    model: "F-150",
    type: "Truck",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "FRD-F1"
  },
  {
    make: "Ford",
    model: "Mustang",
    type: "Coupe",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "FRD-MS"
  },
  {
    make: "Chevrolet",
    model: "Silverado",
    type: "Truck",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "CHV-SV"
  },
  {
    make: "BMW",
    model: "3 Series",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "BMW-3S"
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class",
    type: "Sedan",
    years: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
    assetPrefix: "MBZ-CC"
  }
];

// Vehicle type detection using ML model
export async function detectVehicleType(imageFile: File): Promise<string | null> {
  try {
    // Initialize the vision model if not already done
    const isModelReady = await initializeVisionModel();
    if (!isModelReady) {
      console.error("Vehicle vision model not ready");
      return null;
    }
    
    // Convert the image to a format that can be used by the model
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Use the vision model to classify the vehicle
    const classifier = await pipeline('image-classification', 'Xenova/resnet-18-vehicle-type');
    const result = await classifier(imageUrl);
    
    // Clean up the URL
    URL.revokeObjectURL(imageUrl);
    
    // Extract the vehicle type with highest confidence
    if (result && Array.isArray(result) && result.length > 0) {
      console.log('Vehicle classification results:', result);
      // Fix the property access to use the correct structure
      return mapClassificationToType(result[0].label || '');
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting vehicle type:', error);
    return null;
  }
}

// Map the model classification to our vehicle types
function mapClassificationToType(classification: string): string {
  // Map the model output to our vehicle type categories
  const typeMapping: Record<string, string> = {
    'sedan': 'Sedan',
    'suv': 'SUV',
    'hatchback': 'Hatchback',
    'truck': 'Truck',
    'pickup': 'Truck',
    'van': 'Van',
    'convertible': 'Convertible',
    'coupe': 'Coupe',
    'minivan': 'Van',
  };
  
  const lowerClass = classification.toLowerCase();
  
  for (const [key, value] of Object.entries(typeMapping)) {
    if (lowerClass.includes(key)) {
      return value;
    }
  }
  
  return classification; // Return the original if no mapping found
}

// Detect asset number from the image
export async function detectAssetNumber(imageFile: File): Promise<string | null> {
  try {
    // Use our existing OCR functionality from ocrUtils
    const { performOCR } = await import('./ocrUtils');
    const ocrText = await performOCR(imageFile);
    
    // Look for asset number patterns (e.g., TYT-CM-12345, TSL-MY-54321)
    const assetPatterns = vehicleDatabase.map(vehicle => vehicle.assetPrefix);
    
    // Find any matching asset numbers in the OCR text
    for (const prefix of assetPatterns) {
      const pattern = new RegExp(`${prefix}-\\d{4,6}`, 'i');
      const matches = ocrText.match(pattern);
      
      if (matches && matches.length > 0) {
        return matches[0].toUpperCase();
      }
    }
    
    // Look for general asset number patterns
    const generalPattern = /ASSET[\s:#-]*(\d{4,6})/i;
    const generalMatches = ocrText.match(generalPattern);
    
    if (generalMatches && generalMatches.length > 1) {
      return `ASSET-${generalMatches[1]}`;
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting asset number:', error);
    return null;
  }
}

// Improved vehicle detection function
export const identifyVehicleFromImage = async (imageFile: File): Promise<OCRResult> => {
  try {
    // Run both vision and text recognition in parallel
    const [vehicleType, ocrResult] = await Promise.all([
      detectVehicleType(imageFile),
      processImageWithLegacyOCR(imageFile)
    ]);
    
    // Extract asset number
    const assetNumber = await detectAssetNumber(imageFile);
    
    // Combine the results
    const combinedResult: OCRResult = {
      success: true,
      data: {
        ...ocrResult.data,
        type: vehicleType || ocrResult.data?.type,
        assetNumber: assetNumber || undefined
      }
    };
    
    console.log('Combined vehicle identification results:', combinedResult);
    return combinedResult;
  } catch (error) {
    console.error('Error identifying vehicle from image:', error);
    return {
      success: false,
      error: "Failed to process the vehicle image"
    };
  }
}

// Import the existing OCR processing function from ocrUtils
async function processImageWithLegacyOCR(imageFile: File): Promise<OCRResult> {
  try {
    const { processImageWithOCR } = await import('./ocrUtils');
    return await processImageWithOCR(imageFile);
  } catch (error) {
    console.error('Error using legacy OCR:', error);
    return {
      success: false,
      error: "Failed to process image with OCR"
    };
  }
}

// Enhanced vehicle recognition - combines all approaches for best results
export const enhancedVehicleRecognition = async (imageFile: File): Promise<OCRResult> => {
  try {
    // Show processing toast
    const toastId = toast.loading("Analyzing vehicle image...", {
      duration: 10000
    });
    
    // Try to identify the vehicle
    const result = await identifyVehicleFromImage(imageFile);
    
    // Update toast based on result
    if (result.success) {
      toast.success("Vehicle identification complete", {
        id: toastId
      });
    } else {
      toast.error("Vehicle identification failed", {
        id: toastId
      });
    }
    
    return result;
  } catch (error) {
    console.error('Enhanced vehicle recognition error:', error);
    toast.error("Failed to recognize vehicle");
    return {
      success: false,
      error: "Failed to recognize vehicle"
    };
  }
}

// Check if a vehicle make and model combination exists in our database
export function validateVehicleMakeModel(make: string, model: string): boolean {
  return vehicleDatabase.some(vehicle => 
    vehicle.make.toLowerCase() === make.toLowerCase() && 
    vehicle.model.toLowerCase() === model.toLowerCase()
  );
}

// Get the likely vehicle type based on make and model
export function getVehicleTypeByMakeModel(make: string, model: string): string | null {
  const vehicleMatch = vehicleDatabase.find(vehicle => 
    vehicle.make.toLowerCase() === make.toLowerCase() && 
    vehicle.model.toLowerCase() === model.toLowerCase()
  );
  
  return vehicleMatch ? vehicleMatch.type : null;
}

// Get vehicle suggestions based on partial input
export function getVehicleSuggestions(partialInput: string): Array<{make: string, model: string, type: string}> {
  const normalizedInput = partialInput.toLowerCase();
  
  return vehicleDatabase
    .filter(vehicle => 
      vehicle.make.toLowerCase().includes(normalizedInput) || 
      vehicle.model.toLowerCase().includes(normalizedInput) ||
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(normalizedInput)
    )
    .map(vehicle => ({
      make: vehicle.make,
      model: vehicle.model,
      type: vehicle.type
    }))
    .slice(0, 5); // Limit to 5 suggestions
}

// Initialize models in the background when this module is imported
(async function() {
  try {
    // Start initializing models in the background
    initializeVisionModel();
    initializeTextModel();
  } catch (error) {
    console.error('Failed to initialize vehicle recognition models:', error);
  }
})();
