
import { useEffect } from 'react';

/**
 * A hook that helps fix input focus issues on iOS PWAs
 * by ensuring proper viewport behavior when inputs are focused
 */
export const useIosInputFix = () => {
  useEffect(() => {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (!isIOS) return;

    const handleFocus = () => {
      // Small delay to let the keyboard appear
      setTimeout(() => {
        // Scroll to make sure the input is visible
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT'
        )) {
          // Delay scroll to wait for keyboard to appear
          setTimeout(() => {
            activeElement.scrollIntoView({ block: 'center' });
          }, 100);
        }
      }, 50);
    };

    // Listen for focus events on inputs
    document.addEventListener('focus', handleFocus, true);

    // Cleanup
    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);
};
