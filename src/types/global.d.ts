
// Extend the Window & Navigator interfaces to add iOS-specific properties
interface Navigator {
  /**
   * The standalone property indicates whether the browser is running in standalone mode.
   * This is specific to iOS Safari when the website is added to the home screen.
   */
  standalone?: boolean;
}

// Add other global type extensions as needed
