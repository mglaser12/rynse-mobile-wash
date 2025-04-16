
import React, { useEffect } from "react";
import { AppProviders } from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  // Fix iOS PWA viewport height issues
  useEffect(() => {
    // Handle iOS PWA viewport height issues
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set initial height
    setAppHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setAppHeight);
    window.addEventListener('orientationchange', setAppHeight);
    
    return () => {
      window.removeEventListener('resize', setAppHeight);
      window.removeEventListener('orientationchange', setAppHeight);
    };
  }, []);
  
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
