import { VMTALogo } from './vmta-logo';

interface VMTAFooterProps {
  hideOnMobile?: boolean;
}

export function VMTAFooter({ hideOnMobile = false }: VMTAFooterProps) {
  return (
    <footer className={`bg-gray-50 border-t border-gray-200 py-6 ${hideOnMobile ? 'hidden sm:block' : ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* VMTA Branding */}
          <div className="flex items-center gap-4">
            <VMTALogo variant="footer" size="sm" />
            <div className="text-sm text-gray-600">
              <p>Professional Medical Training Solutions</p>
            </div>
          </div>
          
          {/* Powered by */}
          <div className="text-xs text-gray-500 text-center sm:text-right">
            <p>Powered by VMTA - Visser Medical Training en Advisering</p>
            <p>© {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}