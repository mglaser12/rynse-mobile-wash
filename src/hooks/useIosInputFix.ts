
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

    // Fix viewport scale for inputs
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
    }

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
          // Force selection and ensure it's editable
          if ('setSelectionRange' in activeElement) {
            const input = activeElement as HTMLInputElement;
            const length = input.value.length;
            // Move cursor to end of input
            input.setSelectionRange(length, length);
          }
          
          // Delay scroll to wait for keyboard to appear
          setTimeout(() => {
            activeElement.scrollIntoView({ block: 'center' });
          }, 300);
        }
      }, 100);
    };

    // Enhance all inputs specifically for iOS PWAs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'on');
      
      // For password fields, ensure they're properly handled
      if (input instanceof HTMLInputElement && input.type === 'password') {
        input.setAttribute('autocomplete', 'current-password');
      }
    });

    // Listen for focus events on inputs
    document.addEventListener('focus', handleFocus, true);
    
    // Add special handling for touchstart on inputs
    const handleInputTouch = (e: Event) => {
      const input = e.target as HTMLElement;
      if (input && (
        input.tagName === 'INPUT' ||
        input.tagName === 'TEXTAREA' ||
        input.tagName === 'SELECT'
      )) {
        setTimeout(() => {
          (input as HTMLInputElement).focus();
        }, 10);
      }
    };
    
    inputs.forEach(input => {
      input.addEventListener('touchstart', handleInputTouch);
    });

    // Cleanup
    return () => {
      document.removeEventListener('focus', handleFocus, true);
      inputs.forEach(input => {
        input.removeEventListener('touchstart', handleInputTouch);
      });
    };
  }, []);
};
