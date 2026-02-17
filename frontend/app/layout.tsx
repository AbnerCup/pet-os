'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/pricing'];

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const isPublicPath = PUBLIC_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    if (loading) return;

    // Si no está autenticado y no es una ruta pública
    if (!isAuthenticated && !isPublicPath) {
      console.log('Redirecting to login from:', pathname);
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, isPublicPath, pathname, router]);

  if (loading && !isPublicPath) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  return (
    <>
      {isPublicPath ? (
        children
      ) : isAuthenticated ? (
        <div className="flex h-screen bg-stone-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#7c9a6b" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
      </body>
    </html>
  );
}
