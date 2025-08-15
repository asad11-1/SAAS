import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

// Updated Dialog components with proper z-index and improved widths
const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({ 
  className, 
  ...props 
}: DialogPrimitive.DialogPortalProps & { className?: string }) => (
  <DialogPrimitive.Portal className={className} {...props} />
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={`
      fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm 
      data-[state=open]:animate-in data-[state=closed]:animate-out 
      data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
      ${className || ''}
    `}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={`
        fixed left-[50%] top-[50%] z-[110] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] 
        gap-4 border border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 
        backdrop-blur-xl p-6 shadow-2xl duration-200 
        data-[state=open]:animate-in data-[state=closed]:animate-out 
        data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 
        data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
        data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] 
        data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] 
        rounded-2xl max-h-[95vh] overflow-y-auto
        ${className || ''}
      `}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className || ''}`}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className || ''}`}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Form Modal Wrapper - for add/edit forms with wider design
interface FormModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const FormModalWrapper: React.FC<FormModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  title 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-800/50
        rounded-2xl shadow-2xl
        transform transition-all duration-300 scale-100 opacity-100
        ${className}
      `}>
        {/* Header with close button */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Large modal wrapper for detailed views with extra wide design
export const LargeModalWrapper: React.FC<FormModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  title 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative w-full max-w-6xl max-h-[calc(100vh-2rem)] overflow-y-auto
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-800/50
        rounded-2xl shadow-2xl
        transform transition-all duration-300 scale-100 opacity-100
        ${className}
      `}>
        {/* Header with close button */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Medium modal wrapper - balanced size for most use cases
export const MediumModalWrapper: React.FC<FormModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  title 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-800/50
        rounded-2xl shadow-2xl
        transform transition-all duration-300 scale-100 opacity-100
        ${className}
      `}>
        {/* Header with close button */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Small modal wrapper - for confirmations and simple forms
export const SmallModalWrapper: React.FC<FormModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  title 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={`
        relative w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
        border border-gray-200/50 dark:border-gray-800/50
        rounded-2xl shadow-2xl
        transform transition-all duration-300 scale-100 opacity-100
        ${className}
      `}>
        {/* Header with close button */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};