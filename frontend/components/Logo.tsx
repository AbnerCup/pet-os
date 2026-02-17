'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  href?: string;
}

/**
 * Componente Logo de Pet OS
 * Usa el mismo icono SVG (paw-print) que Lucide en todas las plataformas
 */
export function Logo({ 
  showText = true, 
  size = 'md', 
  className,
  href = '/dashboard'
}: LogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-lg' },
    md: { container: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-xl' },
    lg: { container: 'w-14 h-14', icon: 'w-8 h-8', text: 'text-2xl' },
    xl: { container: 'w-20 h-20', icon: 'w-12 h-12', text: 'text-3xl' },
  };

  const s = sizes[size];

  const LogoContent = (
    <>
      {/* Icono Container - Fondo verde con huella blanca */}
      <div className={cn(
        'bg-sage-600 rounded-xl flex items-center justify-center flex-shrink-0',
        s.container
      )}>
        {/* SVG de Lucide paw-print - IDÉNTICO al usado en web y mobile */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('text-white', s.icon)}
        >
          <circle cx="11" cy="4" r="2" />
          <circle cx="18" cy="8" r="2" />
          <circle cx="20" cy="16" r="2" />
          <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
        </svg>
      </div>

      {/* Texto */}
      {showText && (
        <div>
          <h1 className={cn('font-bold text-sage-900', s.text)}>Pet OS</h1>
          <p className="text-xs text-sage-600">Oruro, Bolivia</p>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        className={cn('flex items-center gap-3', className)}
      >
        {LogoContent}
      </Link>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {LogoContent}
    </div>
  );
}

/**
 * Icono Logo simple (solo la huella sin texto)
 * Útil para favicons, loaders, etc.
 */
export function LogoIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  );
}

export default Logo;
