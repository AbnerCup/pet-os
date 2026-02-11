'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/pricing'];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const isPublicPath = PUBLIC_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPath) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, isPublicPath, router]);

  if (loading && !isPublicPath) {
    return (
      <html lang="es">
        <body className="flex items-center justify-center min-h-screen bg-stone-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body className="antialiased">
        {isPublicPath ? (
          children
        ) : (
          <div className="flex h-screen bg-stone-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
