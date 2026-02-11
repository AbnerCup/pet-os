'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Heart,
  Activity,
  MapPin,
  Bell,
  Wallet,
  Settings,
  PawPrint,
  Stethoscope,
  Siren,
  Crown,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, plan: 'free' },
  { name: 'Mis Mascotas', href: '/pets', icon: PawPrint, plan: 'free' },
  { name: 'Salud', href: '/health', icon: Stethoscope, plan: 'free' },
  { name: 'Actividad', href: '/activity', icon: Activity, plan: 'free' },
  { name: 'Ubicación', href: '/location', icon: MapPin, plan: 'paid', feature: 'gps' },
  { name: 'Recordatorios', href: '/reminders', icon: Bell, plan: 'free' },
  { name: 'Gastos', href: '/expenses', icon: Wallet, plan: 'free' },
  { name: 'Emergencia SOS', href: '/sos', icon: Siren, plan: 'premium', feature: 'sos' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isLocked = (item: typeof navigation[0]) => {
    if (item.plan === 'free') return false;
    if (item.plan === 'paid' && user?.plan === 'FREE') return true;
    if (item.plan === 'premium' && user?.plan !== 'FAMILY') return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-sage-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sage-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sage-900">Pet OS</h1>
            <p className="text-xs text-sage-600">Oruro, Bolivia</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const locked = isLocked(item);
          const Icon = item.icon;

          return (
            <div key={item.name} className="relative">
              {locked ? (
                <Link
                  href={`/pricing?upgrade=${item.feature}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:bg-sage-50 transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  <Crown className="w-4 h-4 text-amber-500" />
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sage-100 text-sage-700 shadow-sm'
                      : 'text-stone-600 hover:bg-sage-50 hover:text-sage-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive ? 'text-sage-600' : 'text-stone-400')} />
                  {item.name}
                  {item.name === 'Emergencia SOS' && !locked && (
                    <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Plan Badge */}
      <div className="p-4 border-t border-sage-100">
        <div className="bg-gradient-to-r from-sage-600 to-sage-700 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan Actual</span>
            <Crown className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold">{user?.plan || 'FREE'}</p>
          {user?.plan === 'FREE' && (
            <Link href="/pricing" className="text-xs text-white/80 hover:text-white underline mt-1 block">
              Actualizar →
            </Link>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sage-50">
          <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center">
            <span className="text-sage-700 font-semibold">
              {user?.name?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sage-900 truncate">{user?.name}</p>
            <p className="text-xs text-sage-600 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-stone-400 hover:text-red-500">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
