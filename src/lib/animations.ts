
// Animation utility functions and constants for micro-interactions

// Timing functions
export const timings = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  verySlow: '500ms',
};

// Easing functions
export const easings = {
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// Combined timing and easing for common animations
export const transitions = {
  hover: `transform ${timings.fast} ${easings.easeOut}`,
  press: `transform ${timings.fast} ${easings.spring}`,
  fade: `opacity ${timings.normal} ${easings.easeOut}`,
  scale: `transform ${timings.normal} ${easings.spring}`,
  slide: `transform ${timings.normal} ${easings.easeInOut}`,
  spin: `transform ${timings.slow} linear`,
};

// Animation keyframes and variants
export const variants = {
  fadeIn: {
    initial: 'opacity-0',
    animate: 'opacity-100 transition-opacity duration-300',
  },
  scaleIn: {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100 transition-all duration-300',
  },
  slideUp: {
    initial: 'opacity-0 translate-y-4',
    animate: 'opacity-100 translate-y-0 transition-all duration-300',
  },
  slideRight: {
    initial: 'opacity-0 -translate-x-4',
    animate: 'opacity-100 translate-x-0 transition-all duration-300',
  },
};
