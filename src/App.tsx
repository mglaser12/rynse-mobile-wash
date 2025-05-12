
import React, { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useIosInputFix } from "./hooks/useIosInputFix";

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
  
  // Apply iOS input fixes
  useIosInputFix();
  
  // Remove the nested AppProviders component since it's already present in main.tsx
  return <AppRoutes />;
};

export default App;
