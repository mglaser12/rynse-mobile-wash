import React from 'react';
import { cn } from '@/lib/utils';
import { transitions } from '@/lib/animations';

interface AnimationProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ScaleOnPress = ({ children, className }: AnimationProps) => {
  return (
    <div className={cn("active:scale-95 transition-transform", className)}>
      {children}
    </div>
  );
};

export const PressableTile = ({ 
  children, 
  className, 
  onClick,
  ...props 
}: AnimationProps & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "active:scale-98 hover:translate-y-[-2px] transition-all duration-200", 
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const FadeIn = ({ children, className }: AnimationProps) => {
  return (
    <div className={cn("animate-fade-in", className)}>
      {children}
    </div>
  );
};

export const SlideUp = ({ children, className }: AnimationProps) => {
  return (
    <div className={cn("animate-slide-up", className)}>
      {children}
    </div>
  );
};

export const SlideDown = ({ children, className }: AnimationProps) => {
  return (
    <div className={cn("animate-slide-down", className)}>
      {children}
    </div>
  );
};

export const SlideInRight = ({ children, className }: AnimationProps) => {
  return (
    <div className={cn("animate-slide-in-right", className)}>
      {children}
    </div>
  );
};

export const SlideInLeft = ({ children, className }: AnimationProps) => {
  return (
    <div className={cn("animate-slide-in-left", className)}>
      {children}
    </div>
  );
};

export const ScaleIn = ({ children, className, style }: AnimationProps) => {
  return (
    <div className={cn("animate-scale-in", className)} style={style}>
      {children}
    </div>
  );
};

export const PulseSoft = ({ children, className, style }: AnimationProps) => {
  return (
    <div className={cn("animate-pulse-soft", className)} style={style}>
      {children}
    </div>
  );
};

export const StaggeredChildren = ({ 
  children, 
  className,
  staggerMs = 100
}: AnimationProps & { staggerMs?: number }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child as React.ReactElement, {
          style: {
            animationDelay: `${index * staggerMs}ms`,
            opacity: 0,
            animation: 'fade-in 0.5s ease-out forwards',
            ...((child as React.ReactElement).props.style || {})
          }
        });
      })}
    </div>
  );
};

// Checkbox Selection Animation
export const SelectionIndicator = ({ isSelected }: { isSelected: boolean }) => {
  return (
    <div className={cn(
      "absolute top-3 right-3 rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300",
      isSelected 
        ? "bg-primary scale-100 opacity-100" 
        : "bg-primary/20 scale-90 opacity-0"
    )}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={cn(
          "text-white transition-transform duration-300",
          isSelected ? "scale-100" : "scale-0"
        )}
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
};

// Ripple effect component for buttons
export const RippleEffect = ({ className }: { className?: string }) => {
  const [coords, setCoords] = React.useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = React.useState(false);

  React.useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      const timer = setTimeout(() => {
        setIsRippling(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [coords]);

  React.useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-lg pointer-events-none",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }}
    >
      {isRippling && (
        <span
          className="absolute rounded-full bg-white/20 animate-ripple"
          style={{
            top: coords.y,
            left: coords.x,
            width: 20,
            height: 20,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </div>
  );
};

// Enhanced button with ripple effect
export const AnimatedButton = ({ 
  children, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => {
  return (
    <button
      className={cn(
        "relative overflow-hidden transition-all hover:brightness-105 active:brightness-95",
        className
      )}
      {...props}
    >
      {children}
      <RippleEffect />
    </button>
  );
};
