
import logoImage from '../../src/assets/logo.png';
// src/components/ui/LoadingOverlay.tsx
import React from 'react';
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';


const loadingVariants = cva(
  "fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background/90",
        primary: "bg-gradient-to-br from-blue-950/95 via-blue-900/95 to-indigo-900/95",
        minimal: "bg-background/60",
      },
      size: {
        default: "",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  message?: string;
  subMessage?: string;
  visible?: boolean;
  showLogo?: boolean;
  showSpinner?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className, 
    variant, 
    size, 
    message = "Loading...", 
    subMessage,
    visible = true,
    showLogo = true,
    showSpinner = true,
    ...props 
  }, ref) => {
    if (!visible) return null;
    
    return (
      <motion.div
        ref={ref}
        className={cn(loadingVariants({ variant, size, className }))}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md">
          {showLogo && (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <motion.div 
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-full p-4 shadow-2xl border border-gray-200 dark:border-gray-800"
                animate={{ 
                  boxShadow: [
                    "0px 0px 20px 0px rgba(59, 130, 246, 0.3)", 
                    "0px 0px 50px 5px rgba(59, 130, 246, 0.5)", 
                    "0px 0px 20px 0px rgba(59, 130, 246, 0.3)"] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-full p-4 flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                    animate={{ 
                      x: ['-200%', '200%']
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-center">
                    <img 
                      src={logoImage} 
                      alt="Logo"
                      className="h-12 w-12 object-contain" 
                      onError={(e) => {
                        // Fallback if logo image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = "h-12 w-12 flex items-center justify-center text-xl font-bold text-white";
                          fallback.innerText = "H";
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          
          <div className="space-y-4">
            <motion.h2 
              className="text-2xl font-bold text-foreground flex items-center justify-center gap-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {message}
              <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
            </motion.h2>
            
            {subMessage && (
              <p className="text-muted-foreground">{subMessage}</p>
            )}
          </div>
          
          {showSpinner && (
            <motion.div 
              animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative"
            >
              <div className="h-16 w-16 rounded-full border-4 border-muted/30 border-t-primary border-r-primary/50 relative">
                <motion.div 
                  className="absolute inset-0" 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                >
                  <div className="h-2 w-2 bg-primary rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          <div className="mt-4 flex flex-col items-center gap-1">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 bg-primary/80 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">© {new Date().getFullYear()} Hadran</p>
          </div>
        </div>
      </motion.div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";

export default LoadingOverlay;