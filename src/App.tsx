
import { useEffect } from "react";
import { AppProviders } from "./providers/AppProviders";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  // Handle iOS standalone mode (when added to home screen)
  useEffect(() => {
    // Fix for iOS viewport height issues in standalone mode
    const setIOSAppHeight = () => {
      if (window.navigator.standalone) {
        // Set a CSS variable with the actual viewport height
        document.documentElement.style.setProperty(
          '--app-height', 
          `${window.innerHeight}px`
        );
      }
    };

    // Set initially and add resize listener
    setIOSAppHeight();
    window.addEventListener('resize', setIOSAppHeight);

    return () => {
      window.removeEventListener('resize', setIOSAppHeight);
    };
  }, []);

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
