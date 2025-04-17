
// Logging utility for vehicle operations

/**
 * Log vehicle operation with detailed request data
 */
export const logVehicleOperation = (operation: string, requestData: any, id?: string) => {
  console.group(`🚗 Vehicle Operation: ${operation}`);
  console.log(`Time: ${new Date().toISOString()}`);
  if (id) console.log(`Vehicle ID: ${id}`);
  console.log("Request Data:", requestData);
  console.groupEnd();
};

/**
 * Log response from a vehicle operation
 */
export const logVehicleResponse = (operation: string, response: any, error?: any) => {
  console.group(`🚗 Vehicle Response: ${operation}`);
  console.log(`Time: ${new Date().toISOString()}`);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Response:", response);
  }
  console.groupEnd();
};

/**
 * Log a vehicle operation step for more detailed debugging
 */
export const logVehicleOperationStep = (operation: string, step: string, data?: any) => {
  console.group(`🚗 Vehicle Step: ${operation} - ${step}`);
  console.log(`Time: ${new Date().toISOString()}`);
  if (data) console.log("Details:", data);
  console.groupEnd();
};

/**
 * Create a tagged log entry for filtering in console
 */
export const vehicleLog = (message: string, data?: any) => {
  console.log(`[VEHICLE_LOG] ${message}`, data || '');
};
