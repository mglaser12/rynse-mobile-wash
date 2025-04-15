
// This file is kept for backward compatibility
// It re-exports everything from the new location
export { 
  WashProvider,
  useWash,
  useWashRequests
} from './wash';

export type { 
  WashContextType,
  CreateWashRequestData
} from './wash/types';
