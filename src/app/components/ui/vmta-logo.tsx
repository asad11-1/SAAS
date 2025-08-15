import Image from 'next/image';

interface VMTALogoProps {
  variant?: 'logo-only' | 'header' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function VMTALogo({ variant = 'header', size = 'md', className = '' }: VMTALogoProps) {
  const dimensions = {
    sm: { width: 120, height: 40 },
    md: { width: 160, height: 50 },
    lg: { width: 200, height: 65 },
    xl: { width: 280, height: 90 },
  };

  const logoSources = {
    'logo-only': '/images/vmta-logo.png',
    'header': '/images/vmta-header-logo.png',
    'footer': '/images/vmta-header-logo.png',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSources[variant]}
        alt="VMTA - Visser Medical Training en Advisering"
        width={dimensions[size].width}
        height={dimensions[size].height}
        className="object-contain"
        priority={variant === 'header'}
      />
    </div>
  );
}